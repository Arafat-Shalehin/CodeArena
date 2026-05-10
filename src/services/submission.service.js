import mongoose from 'mongoose'
import { Submission } from '@/models/Submission.models'
import { User } from '@/models/User.models'
import { Problem } from '@/models/Problem.models'
import { ContestParticipant } from '@/models/ContestParticipant.models'
import { Contest } from '@/models/Contest.models'
import { executionPort } from '@/lib/execution'
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
        skipRateLimit = false,
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

    const session = null // Transactions are slow and unnecessary here

    try {
        console.log('[SERVICE] Validating user & problem...')
        // 1️⃣ Validate user
        const user = await User.findById(userId).select('_id').lean()
        if (!user) {
            throw new Error('User not found.')
        }
        console.log('[SERVICE] User validated:', userId)

        // 2️⃣ Validate problem
        const problem = await Problem.findById(problemId)
            .select('_id codeSizeLimit testCaseCount')
            .lean()
        if (!problem) {
            throw new Error('Problem not found.')
        }
        console.log('[SERVICE] Problem validated:', problemId)

        // 3️⃣ Rate limit (Redis-based throttle: 3 sec cooldown)
        if (type === 'submit' && !skipRateLimit && redisClient.isOpen) {
            const rateLimitKey = `ratelimit:submit:${userId}`
            const isThrottled = await redisClient.get(rateLimitKey)

            if (isThrottled) {
                throw new Error('Submission rate limit exceeded. Please wait.')
            }

            // Set throttle for 3 seconds
            await redisClient.set(rateLimitKey, '1', { EX: 3 })
        } else if (type === 'submit' && !skipRateLimit) {
            // Fallback to basic DB check if Redis is down
            const lastSubmission = await Submission.findOne({ userId, type: 'submit' }).sort({
                createdAt: -1,
            })

            if (
                lastSubmission &&
                Date.now() - new Date(lastSubmission.createdAt).getTime() < 3000
            ) {
                throw new Error('Submission rate limit exceeded. Please wait.')
            }
        }

        // 4️⃣ Contest validation (if provided)
        if (contestId && type === 'submit') {
            const contest = await Contest.findById(contestId).select('startTime endTime').lean()
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
            const isRegistered = await ContestParticipant.exists({
                contestId,
                userId,
            })

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

        const submission = await Submission.create(submissionData)

        console.log('[SERVICE] Submission saved to DB:', submission._id)

        // 7️⃣ Push to Message Queue (BullMQ) - ONLY if not using cached result
        if (!cachedResult) {
            try {
                await executionPort.submit(submission._id)
                console.log('[SERVICE] Added job to submission-queue...')

                const waitingCount = await executionPort.getWaitingCount()
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
                        submissionId: submission._id,
                        problemId,
                        stage: 'queued',
                        status: 'queued',
                        verdict: 'PENDING',
                        progress: 0,
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
                                submissionId: submission._id,
                                problemId,
                                stage: 'queued',
                                status: 'queued',
                                verdict: 'PENDING',
                                progress: 0,
                                message: queueMessage,
                                queueAhead,
                                event: 'SUBMISSION_STATUS',
                                current: 0,
                                total: Number(problem?.testCaseCount) || 0,
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
                            submissionId: submission._id,
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

        console.log('[SERVICE] Returning submission:', submission._id)
        return submission.toJSON()
    } catch (error) {
        console.error('[SERVICE] Submission error:', error.message)
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
        .lean()

    if (!submission) {
        const err = new Error('Submission not found.')
        err.status = 404
        throw err
    }

    return submission
}
