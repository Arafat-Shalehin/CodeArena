import { Worker } from 'bullmq'
import { connection } from '@/lib/queue'
import { User } from '@/models/User.models'
import { Submission } from '@/models/Submission.models'
import { Problem } from '@/models/Problem.models'
import { TestCase } from '@/models/TestCase.models'
import { executeCode } from '@/lib/docker/executor'
import { redisClient } from '@/lib/redis'
import { syncUserStats } from '@/services/user.service'
import { VERDICTS } from '@/lib/evaluation/verdicts'
import { analyzeSubmissionCode } from '@/lib/ai/groqClient'

/**
 * Worker to process code submissions
 */
export function initSubmissionWorker() {
    const worker = new Worker(
        'submission-queue',
        async (job) => {
            const { submissionId } = job.data
            // console.log(`[WORKER] Started processing submission: ${submissionId}`)

            try {
                // 1. Fetch submission
                const submission = await Submission.findById(submissionId)
                if (!submission) {
                    throw new Error(`Submission ${submissionId} not found`)
                }

                // Idempotency: skip if already evaluating or completed
                if (submission.status === 'running' || submission.status === 'completed') {
                    console.log(
                        `[WORKER] Skipping submission ${submissionId} - already ${submission.status}`
                    )
                    return
                }

                // Update status to 'running'
                await Submission.findByIdAndUpdate(submissionId, { status: 'running' })
                if (redisClient.isOpen) {
                    redisClient
                        .publish(
                            'submission_updates',
                            JSON.stringify({
                                type: 'submission_running',
                                userId: submission.userId,
                                submissionId,
                                problemId: submission.problemId,
                            })
                        )
                        .catch(console.error)
                }

                // 2. Fetch problem details for limits
                const problem = await Problem.findById(submission.problemId)
                if (!problem) {
                    throw new Error(`Problem ${submission.problemId} not found`)
                }

                // 3. Fetch all test cases for the problem
                const testCases = await TestCase.find({ problemId: submission.problemId }).sort({
                    order: 1,
                })

                console.log(
                    `[WORKER] ${testCases.length} test case(s) loaded for problem ${submission.problemId}`
                )

                const totalCount = testCases.length

                const testCaseResults = []
                let passedCount = 0
                let maxTime = 0
                let maxMemory = 0
                let finalVerdict = VERDICTS.ACCEPTED
                let firstError = null

                if (submission.type === 'run') {
                    // 🚀 'RUN' Path: Execute once with custom input
                    const result = await executeCode({
                        code: submission.code,
                        files: submission.files || [],
                        language: submission.language,
                        input: submission.customInput || '',
                        timeLimit: problem.timeLimit,
                        memoryLimit: problem.memoryLimit,
                    })

                    maxTime = result.executionTime || 0
                    maxMemory = result.memoryUsed || 0
                    finalVerdict = result.verdict.toUpperCase()
                    firstError = result.error

                    testCaseResults.push({
                        verdict: finalVerdict,
                        time: maxTime,
                        memory: maxMemory,
                        error: firstError,
                        actualOutput: result.output,
                    })
                } else if (totalCount === 0) {
                    finalVerdict = VERDICTS.SYSTEM_ERROR
                    firstError = 'No test cases found for this problem.'
                } else {
                    // 🏁 'SUBMIT' Path: Run all test cases
                    console.log(
                        `[WORKER] Running ${totalCount} test case(s) for submission ${submissionId}`
                    )
                    for (let i = 0; i < totalCount; i++) {
                        const testCase = testCases[i]

                        // Execute code (including special judge if enabled)
                        const result = await executeCode({
                            code: submission.code,
                            files: submission.files || [],
                            language: submission.language,
                            input: testCase.input || '',
                            timeLimit: problem.timeLimit,
                            memoryLimit: problem.memoryLimit,
                            // Pass special judge details to executor for secure sandboxed execution
                            specialJudgeCode:
                                problem.judgeType === 'special' ? problem.specialJudgeCode : null,
                            expectedOutput: testCase.expectedOutput,
                        })

                        maxTime = Math.max(maxTime, result.executionTime || 0)
                        maxMemory = Math.max(maxMemory, result.memoryUsed || 0)

                        // Normalize result verdict to our enum
                        let resultVerdict = result.verdict.toUpperCase()

                        if (resultVerdict === 'SUCCESS' || resultVerdict === 'ACCEPTED') {
                            if (!problem.judgeType || problem.judgeType === 'exact') {
                                // Compare exact match ignoring spacing variations
                                const normalizeOutput = (str) =>
                                    (str || '').trim().split(/\s+/).join(' ')
                                const actual = normalizeOutput(result.output)
                                const expected = normalizeOutput(testCase.expectedOutput)

                                if (actual !== expected) {
                                    resultVerdict = VERDICTS.WRONG_ANSWER
                                    result.error = 'Output does not match expected output'
                                }
                            }
                        }

                        if (resultVerdict === 'SUCCESS') {
                            resultVerdict = VERDICTS.ACCEPTED
                        }

                        // 4. Update individual test case result
                        console.log(
                            `[WORKER] Test Case ${i + 1}/${totalCount}: ${resultVerdict} (${result.executionTime}ms)`
                        )
                        const caseResult = {
                            testCaseId: testCase._id,
                            verdict: resultVerdict,
                            time: result.executionTime || 0,
                            memory: result.memoryUsed || 0,
                            error: result.error || '',
                            isSample: testCase.isSample || false,
                        }

                        // Only store actual output for sample test cases (for UI feedback)
                        if (testCase.isSample) {
                            caseResult.actualOutput = result.output
                        }

                        testCaseResults.push(caseResult)

                        if (resultVerdict === 'SUCCESS' || resultVerdict === VERDICTS.ACCEPTED) {
                            // If it's a success, it means it passed either exact match (default)
                            // or the special judge (inside Docker)
                            passedCount++
                        } else {
                            // First failure determines final verdict
                            finalVerdict = resultVerdict
                            firstError = result.error
                            break
                        }
                    }
                }

                // 4. Update submission with results
                const updatedSubmission = await Submission.findByIdAndUpdate(
                    submissionId,
                    {
                        status: 'completed',
                        verdict: finalVerdict,
                        executionTime: maxTime,
                        memoryUsed: maxMemory,
                        error: firstError,
                        testCaseResults: testCaseResults,
                    },
                    { new: true }
                )

                if (redisClient.isOpen && updatedSubmission) {
                    redisClient
                        .publish(
                            'submission_updates',
                            JSON.stringify({
                                type: 'submission_evaluated',
                                userId: submission.userId,
                                submissionId,
                                problemId: submission.problemId,
                                status: 'completed',
                                verdict: finalVerdict,
                                executionTime: maxTime,
                                memoryUsed: maxMemory,
                            })
                        )
                        .catch(console.error)
                }

                // 5. Update Global Stats via Service (Single Source of Truth)
                // Only sync for 'submit' type
                if (submission.type === 'submit' && finalVerdict !== VERDICTS.SYSTEM_ERROR) {
                    const isAccepted = finalVerdict === VERDICTS.ACCEPTED

                    // Always increment total submission counter for the problem
                    await Problem.findByIdAndUpdate(submission.problemId, {
                        $inc: { totalSubmissions: 1 },
                    })

                    // Synchronize all user stats (recalculate from DB — single source of truth)
                    const oldUser = await User.findById(submission.userId).select(
                        'stats.globalRank'
                    )
                    const updatedUser = await syncUserStats(submission.userId)

                    // NEW: Rank Shift Notification
                    if (oldUser && updatedUser && updatedUser.stats?.globalRank) {
                        const { checkAndNotifyRankShift } =
                            await import('@/services/notification.service')
                        const oldRank = oldUser.stats?.globalRank || 999999
                        const newRank = updatedUser.stats.globalRank
                        if (newRank < oldRank) {
                            await checkAndNotifyRankShift(submission.userId, oldRank, newRank)
                        }
                    }

                    // Only increment problem's accepted count the FIRST time this user solves it
                    if (isAccepted) {
                        const previousAcceptedCount = await Submission.countDocuments({
                            userId: submission.userId,
                            problemId: submission.problemId,
                            verdict: { $regex: new RegExp(`^${VERDICTS.ACCEPTED}$`, 'i') },
                            _id: { $ne: submission._id }, // exclude the current one
                        })

                        if (previousAcceptedCount === 0) {
                            // First accepted submission for this user on this problem
                            await Problem.findByIdAndUpdate(submission.problemId, {
                                $inc: { acceptedSubmissions: 1 },
                            })
                        }
                    }

                    // 6. Invalidate Redis Caches to prevent stale data
                    if (redisClient.isOpen) {
                        const keysToInvalidate = [
                            'leaderboard:global',
                            `user:stats:${submission.userId}`,
                            `problem:stats:${submission.problemId}`,
                        ]
                        await Promise.all(
                            keysToInvalidate.map((key) => redisClient.del(key).catch(() => {}))
                        )
                        console.log(
                            `[WORKER] Invalidated Redis caches for user ${submission.userId}`
                        )
                    }

                    // 7. AI Analysis (Optional/Async-ish)
                    // Trigger AI evaluation if enabled and it's a real submission
                    if (process.env.ENABLE_AI_ANALYSIS === 'true') {
                        console.log(
                            `[WORKER] Triggering AI analysis for submission ${submissionId}`
                        )
                        // We run this AFTER the user sees the verdict to not block main result
                        // But before job finishes to ensure it's tracked
                        try {
                            const aiFeedback = await analyzeSubmissionCode({
                                code: submission.code,
                                language: submission.language,
                                problemTitle: problem.title,
                                verdict: finalVerdict,
                                executionTime: maxTime,
                                memoryUsed: maxMemory,
                            })

                            if (aiFeedback) {
                                await Submission.findByIdAndUpdate(submissionId, { aiFeedback })
                                console.log(`[WORKER] AI feedback saved for ${submissionId}`)

                                // NEW: AI Insight Notification
                                const { sendNotification } =
                                    await import('@/services/notification.service')
                                await sendNotification({
                                    recipientId: submission.userId,
                                    type: 'ai_insight',
                                    message: `AI Insights are ready for your solution to "${problem.title}"`,
                                    link: `/problems/${submission.problemId}?tab=results&submission=${submissionId}`,
                                    metadata: { submissionId, problemId: submission.problemId },
                                })
                            }
                        } catch (aiErr) {
                            console.error('[WORKER] AI Analysis failed:', aiErr.message)
                            // We don't fail the job if AI analysis fails
                        }
                    }

                    // NEW: Judging Result Notification
                    const { sendNotification } = await import('@/services/notification.service')
                    await sendNotification({
                        recipientId: submission.userId,
                        type: 'judging',
                        message: `Solution for "${problem.title}" ${finalVerdict === VERDICTS.ACCEPTED ? 'Accepted! 🚀' : 'evaluated: ' + finalVerdict}`,
                        link: `/problems/${submission.problemId}?tab=results&submission=${submissionId}`,
                        metadata: {
                            submissionId,
                            problemId: submission.problemId,
                            verdict: finalVerdict,
                        },
                    })
                }

                return { verdict: finalVerdict, passedCount, totalCount }
            } catch (error) {
                console.error(`CRITICAL: Error processing submission ${submissionId}: `, error)
                const errorMessage = error.message || 'Unknown system error'

                const erSubmission = await Submission.findByIdAndUpdate(
                    submissionId,
                    {
                        status: 'error',
                        verdict: VERDICTS.SYSTEM_ERROR,
                        error: `Judge Error: ${errorMessage} `,
                    },
                    { new: true }
                )

                if (redisClient.isOpen && erSubmission) {
                    redisClient
                        .publish(
                            'submission_updates',
                            JSON.stringify({
                                type: 'submission_evaluated',
                                userId: erSubmission.userId,
                                submissionId,
                                problemId: erSubmission.problemId,
                                status: 'error',
                                verdict: VERDICTS.SYSTEM_ERROR,
                                error: `Judge Error: ${errorMessage} `,
                            })
                        )
                        .catch(console.error)
                }
                throw error
            }
        },
        {
            connection,
            concurrency: 2,
        }
    )

    worker.on('completed', (job) => {
        console.log(`Submission ${job.data.submissionId} completed successfully`)
    })

    worker.on('failed', (job, err) => {
        console.error(`Submission ${job.data.submissionId} failed: `, err)
    })

    return worker
}
