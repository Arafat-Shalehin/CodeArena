import mongoose from 'mongoose'
import { Submission } from '@/models/Submission.models'
import { User } from '@/models/User.models'
import { Problem } from '@/models/Problem.models'
import { ContestParticipant } from '@/models/ContestParticipant.models'
import { Contest } from '@/models/Contest.models'
import { getSubmissionQueue } from '@/lib/queue'
import { redisClient } from '@/lib/redis'

/**
 * Create a new submission
 */
export async function createSubmission(data) {
    const {
        userId,
        problemId,
        code,
        language,
        contestId,
        type = 'submit',
        customInput,
        cachedResult,
    } = data

    console.log('[SERVICE] createSubmission called:', {
        userId,
        problemId,
        type,
        codeLength: code?.length,
        cachedResult: !!cachedResult,
    })

    if (!userId || !problemId) {
        throw new Error('User and problem are required.')
    }

    if (!code || !language) {
        throw new Error('Code and language are required.')
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        console.log('[SERVICE] Starting transaction...')
        // 1️⃣ Validate user
        const user = await User.findById(userId).session(session)
        if (!user) {
            throw new Error('User not found.')
        }
        console.log('[SERVICE] User validated:', userId)

        // 2️⃣ Validate problem
        const problem = await Problem.findById(problemId).session(session)
        if (!problem) {
            throw new Error('Problem not found.')
        }
        console.log('[SERVICE] Problem validated:', problemId)

        // 3️⃣ Rate limit (Redis-based throttle: 3 sec cooldown)
        if (type === 'submit' && redisClient.isOpen) {
            const rateLimitKey = `ratelimit:submit:${userId}`
            const isThrottled = await redisClient.get(rateLimitKey)

            if (isThrottled) {
                throw new Error('Submission rate limit exceeded. Please wait.')
            }

            // Set throttle for 3 seconds
            await redisClient.set(rateLimitKey, '1', { EX: 3 })
        } else if (type === 'submit') {
            // Fallback to basic DB check if Redis is down
            const lastSubmission = await Submission.findOne({ userId, type: 'submit' })
                .sort({ createdAt: -1 })
                .session(session)

            if (
                lastSubmission &&
                Date.now() - new Date(lastSubmission.createdAt).getTime() < 3000
            ) {
                throw new Error('Submission rate limit exceeded. Please wait.')
            }
        }

        // 4️⃣ Contest validation (if provided)
        if (contestId && type === 'submit') {
            const contest = await Contest.findById(contestId).session(session)
            if (!contest) {
                throw new Error('Contest not found.')
            }

            const now = new Date()

            if (contest.startTime && now < contest.startTime) {
                throw new Error('Contest has not started yet.')
            }

            if (contest.endTime && now > contest.endTime) {
                throw new Error('Contest has already ended.')
            }

            // Check participant registration via ContestParticipant collection
            const isRegistered = await ContestParticipant.findOne({
                contestId,
                userId,
            }).session(session)

            if (!isRegistered) {
                throw new Error('User is not registered for this contest.')
            }
        }

        // Check for code size limit
        const codeSizeKB = Buffer.byteLength(code, 'utf8') / 1024
        if (codeSizeKB > problem.codeSizeLimit) {
            return {
                status: 400,
                message: `Code size (${codeSizeKB.toFixed(1)} KB) exceeds the limit (${problem.codeSizeLimit} KB)`,
            }
        }

        // 5️⃣ Create submission
        // If cachedResult is provided, use it directly (skip queue)
        const submissionData = {
            userId,
            problemId,
            contestId,
            type,
            code,
            customInput,
            language,
        }

        if (cachedResult) {
            console.log('[SERVICE] 🚀 Using cached result, skipping queue processing...')
            submissionData.status = 'completed'
            submissionData.verdict = cachedResult.verdict
            submissionData.executionTime = cachedResult.executionTime || 0
            submissionData.memoryUsed = cachedResult.memoryUsed || 0
            submissionData.error = cachedResult.error || ''
        } else {
            submissionData.status = 'queued'
        }

        const submission = await Submission.create([submissionData], { session })

        await session.commitTransaction()
        session.endSession()
        console.log('[SERVICE] Submission saved to DB:', submission[0]._id)

        // 7️⃣ Push to Message Queue (BullMQ) - ONLY if not using cached result
        if (!cachedResult) {
            try {
                const queue = getSubmissionQueue()
                console.log('[SERVICE] Adding job to submission-queue...')
                await queue.add('process-submission', {
                    submissionId: submission[0]._id,
                })
                console.log('[SERVICE] Job added to queue successfully')

                let waitingCount = 0
                try {
                    waitingCount = await queue.getWaitingCount()
                } catch (err) {
                    console.warn('[SERVICE] Failed to read queue waiting count:', err?.message)
                }

                const queueAhead = Math.max(0, waitingCount - 1)
                const queueMessage =
                    queueAhead > 0
                        ? `Queued. ${queueAhead} ahead in queue...`
                        : 'Queued. Starting shortly...'

                // 8️⃣ Publish event for real-time updates
                if (redisClient.isOpen) {
                    console.log('[SERVICE] Publishing submission_queued event...')
                    const queuedPayload = {
                        type: 'submission_queued',
                        userId,
                        submissionId: submission[0]._id,
                        problemId,
                        stage: 'queued',
                        message: queueMessage,
                        queueAhead,
                        event: 'SUBMISSION_STATUS',
                    }

                    redisClient
                        .publish('submission_updates', JSON.stringify(queuedPayload))
                        .catch(console.error)

                    // Backward-compatible stage stream for existing and new clients.
                    redisClient
                        .publish(
                            'submission_updates',
                            JSON.stringify({
                                type: 'submission_status',
                                userId,
                                submissionId: submission[0]._id,
                                problemId,
                                stage: 'queued',
                                status: 'queued',
                                message: queueMessage,
                                queueAhead,
                                event: 'SUBMISSION_STATUS',
                                current: 0,
                            })
                        )
                        .catch(console.error)
                }
            } catch (queueError) {
                console.error('[SERVICE] Failed to add submission to queue:', queueError)
            }
        } else {
            // 🚀 CACHED RESULT: Publish submission_evaluated event immediately
            console.log('[SERVICE] 🚀 Publishing submission_evaluated event (cached result)...')
            if (redisClient.isOpen) {
                redisClient
                    .publish(
                        'submission_updates',
                        JSON.stringify({
                            type: 'submission_evaluated',
                            userId,
                            submissionId: submission[0]._id,
                            problemId,
                            status: 'completed',
                            verdict: cachedResult.verdict,
                            executionTime: cachedResult.executionTime || 0,
                            memoryUsed: cachedResult.memoryUsed || 0,
                            error: cachedResult.error || '',
                        })
                    )
                    .catch(console.error)
            }
        }

        console.log('[SERVICE] Returning submission:', submission[0]._id)
        return submission[0]
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }
}

/**
 * Get all submissions (with filtering)
 */
export async function getAllSubmissions(query) {
    const page = Math.max(parseInt(query.page) || 1, 1)
    const limit = Math.min(parseInt(query.limit) || 10, 100)
    const skip = query.offset != null ? parseInt(query.offset) : (page - 1) * limit

    const filter = {}

    if (query.problemId) filter.problemId = query.problemId
    if (query.userId) filter.userId = query.userId
    if (query.contestId) filter.contestId = query.contestId
    if (query.verdict) filter.verdict = query.verdict
    if (query.status) filter.status = query.status

    const [submissions, total] = await Promise.all([
        Submission.find(filter)
            .populate('userId', 'name email')
            .populate('problemId', 'title difficulty')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Submission.countDocuments(filter),
    ])

    return {
        submissions,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    }
}

/**
 * Get submission by ID
 */
export async function getSubmissionById(id) {
    const submission = await Submission.findById(id)
        .populate('userId', 'name email')
        .populate('problemId', 'title difficulty')

    if (!submission) {
        const err = new Error('Submission not found.')
        err.status = 404
        throw err
    }

    return submission
}
