import { Worker } from 'bullmq'
import dbConnect from '@/lib/mongodb'
import { connection, getAIAnalysisQueue, getStatsQueue } from '@/lib/queue'
import { User } from '@/models/User.models'
import { Submission } from '@/models/Submission.models'
import { Problem } from '@/models/Problem.models'
import { TestCase } from '@/models/TestCase.models'
import { executeCode } from '@/lib/docker/executor'
import { redisClient } from '@/lib/redis'
import { VERDICTS } from '@/lib/evaluation/verdicts'

/**
 * Worker to process code submissions
 */
export function initSubmissionWorker() {
    console.log('[WORKER INIT] Starting submission worker initialization...')
    console.log('[WORKER INIT] Queue name: submission-queue')
    console.log('[WORKER INIT] Connection:', {
        host: connection.host,
        port: connection.port,
        url: connection.url,
    })

    const worker = new Worker(
        'submission-queue',
        async (job) => {
            const { submissionId } = job.data
            console.log(`[WORKER] Started processing submission: ${submissionId}`)

            try {
                // Connect to MongoDB
                await dbConnect()

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
                    // 🚀 'RUN' Path: Execute once with custom input (Playground - NO JUDGING)
                    console.log(
                        `[WORKER] RUN TYPE: Executing with custom input for submission ${submissionId}`
                    )
                    console.log(
                        `[WORKER] Code length: ${submission.code.length}, Language: ${submission.language}`
                    )

                    const result = await executeCode({
                        code: submission.code,
                        files: submission.files || [],
                        language: submission.language,
                        input: submission.customInput || '',
                        timeLimit: problem.timeLimit,
                        memoryLimit: problem.memoryLimit,
                        isPlayground: true, // Don't judge, just execute
                    })

                    console.log(`[WORKER] Execution result:`, {
                        verdict: result.verdict,
                        time: result.executionTime,
                        error: result.error,
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

                    // 🎮 Socket event for Run result (stdout/stderr only)
                    if (redisClient.isOpen) {
                        console.log(
                            `[WORKER] Publishing run_result event for submission ${submissionId}`
                        )
                        redisClient
                            .publish(
                                'submission_updates',
                                JSON.stringify({
                                    type: 'run_result',
                                    submissionId,
                                    userId: submission.userId,
                                    output: result.output,
                                    error: result.error,
                                    verdict: finalVerdict,
                                    executionTime: maxTime,
                                    memoryUsed: maxMemory,
                                })
                            )
                            .catch(console.error)
                    }
                } else if (totalCount === 0) {
                    console.log(
                        `[WORKER] SUBMIT TYPE but no test cases found for submission ${submissionId}`
                    )
                    finalVerdict = VERDICTS.SYSTEM_ERROR
                    firstError = 'No test cases found for this problem.'
                } else {
                    // 🏁 'SUBMIT' Path: Run all test cases
                    console.log(
                        `[WORKER] SUBMIT TYPE: Running ${totalCount} test case(s) for submission ${submissionId}`
                    )

                    for (let i = 0; i < totalCount; i++) {
                        const testCase = testCases[i]
                        console.log(
                            `[WORKER] Processing test case ${i + 1}/${totalCount} with input length: ${testCase.input?.length || 0}`
                        )

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
                            isPlayground: false, // Don't convert ACCEPTED to EXECUTED for submit
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
                            caseNumber: i + 1,
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

                        // 📊 Real-time progress update via Redis pub/sub
                        if (redisClient.isOpen) {
                            redisClient
                                .publish(
                                    'submission_updates',
                                    JSON.stringify({
                                        type: 'test_case_completed',
                                        submissionId,
                                        userId: submission.userId,
                                        caseNumber: i + 1,
                                        totalTestCases: totalCount,
                                        verdict: resultVerdict,
                                        progress: Math.round(((i + 1) / totalCount) * 100),
                                    })
                                )
                                .catch(console.error)
                        }

                        if (resultVerdict === 'SUCCESS' || resultVerdict === VERDICTS.ACCEPTED) {
                            // If it's a success, it means it passed either exact match (default)
                            // or the special judge (inside Docker)
                            passedCount++
                        } else {
                            // ⚡ FAIL-FAST: Stop on first failure (no need to run remaining test cases)
                            finalVerdict = resultVerdict
                            firstError = result.error
                            console.log(
                                `[WORKER] ⚡ FAIL-FAST: Test case ${i + 1} failed with ${resultVerdict}, stopping evaluation`
                            )
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
                    const eventType = submission.type === 'run' ? 'run_result' : 'submit_result'
                    const eventData = {
                        type: eventType,
                        userId: submission.userId,
                        submissionId,
                        problemId: submission.problemId,
                        status: 'completed',
                        verdict: finalVerdict,
                        executionTime: maxTime,
                        memoryUsed: maxMemory,
                    }

                    // For submit type, include all test case results
                    if (submission.type === 'submit') {
                        eventData.testResults = testCaseResults.map((tc) => ({
                            caseNumber: tc.caseNumber,
                            verdict: tc.verdict,
                            time: tc.time,
                            memory: tc.memory,
                            isSample: tc.isSample,
                            error: tc.error,
                        }))
                        eventData.passedCount = passedCount
                        eventData.totalCount = totalCount
                    }

                    redisClient
                        .publish('submission_updates', JSON.stringify(eventData))
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

                    // Extract heavy stats sync to background queue
                    try {
                        await getStatsQueue().add('sync-stats', { userId: submission.userId })
                    } catch (err) {
                        console.error('[WORKER] Failed to dispatch stats job:', err)
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
                        const keysToInvalidate = [`problem:stats:${submission.problemId}`]
                        await Promise.all(
                            keysToInvalidate.map((key) => redisClient.del(key).catch(() => {}))
                        )
                        console.log(
                            `[WORKER] Invalidated problem caches for ${submission.problemId}`
                        )
                    }

                    // 7. AI Analysis (Decoupled to Background Queue)
                    if (process.env.ENABLE_AI_ANALYSIS === 'true') {
                        try {
                            await getAIAnalysisQueue().add('analyze-code', {
                                submissionId,
                                userId: submission.userId,
                                problemId: submission.problemId,
                                code: submission.code,
                                language: submission.language,
                                problemTitle: problem.title,
                                verdict: finalVerdict,
                                executionTime: maxTime,
                                memoryUsed: maxMemory,
                            })
                            console.log(`[WORKER] Dispatched AI analysis job for ${submissionId}`)
                        } catch (err) {
                            console.error('[WORKER] Failed to dispatch AI analysis job:', err)
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
                console.error(`[WORKER] CRITICAL ERROR processing submission ${submissionId}:`)
                console.error(`[WORKER] Error message: ${error.message}`)
                console.error(`[WORKER] Error stack:`, error.stack)
                const errorMessage = error.message || 'Unknown system error'

                console.log(`[WORKER] Updating submission ${submissionId} status to error`)
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
                    console.log(`[WORKER] Publishing error event`)
                    const eventType = erSubmission.type === 'run' ? 'run_result' : 'submit_result'
                    redisClient
                        .publish(
                            'submission_updates',
                            JSON.stringify({
                                type: eventType,
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

    console.log('[WORKER] Submission worker initialized with concurrency: 2')
    console.log('[WORKER] Worker ready to process jobs from submission-queue')

    worker.on('active', (job) => {
        console.log(`[WORKER] Job ${job.id} is now processing submission ${job.data.submissionId}`)
    })

    worker.on('progress', (job, progress) => {
        console.log(`[WORKER] Job ${job.id} progress: ${progress}%`)
    })

    worker.on('completed', (job) => {
        console.log(`[WORKER] Submission ${job.data.submissionId} completed successfully`)
    })

    worker.on('failed', (job, err) => {
        console.error(`[WORKER] Submission ${job.data.submissionId} failed:`, err.message)
    })

    worker.on('error', (err) => {
        console.error(`[WORKER] Worker error:`, err.message)
    })

    worker.on('stalled', (jobId) => {
        console.warn(`[WORKER] Job ${jobId} stalled`)
    })

    return worker
}
