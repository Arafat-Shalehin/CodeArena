import { Worker } from 'bullmq'
import dbConnect from '@/lib/mongodb'
import { connection, getAIAnalysisQueue, getStatsQueue } from '@/lib/queue'
import { User } from '@/models/User.models'
import { Submission } from '@/models/Submission.models'
import { Problem } from '@/models/Problem.models'
import { TestCase } from '@/models/TestCase.models'
import { executeCode, executeMultipleInputs } from '@/lib/docker/executor'
import { redisClient } from '@/lib/redis'
import { VERDICTS } from '@/lib/evaluation/verdicts'
import { updateParticipantScore } from '@/services/contestParticipant.service'

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

    const workerConcurrency = Math.max(
        1,
        Number.parseInt(process.env.SUBMISSION_WORKER_CONCURRENCY || '4', 10) || 4
    )
    const progressEventStride = Math.max(
        1,
        Number.parseInt(process.env.SUBMISSION_PROGRESS_EVENT_STRIDE || '4', 10) || 4
    )

    const worker = new Worker(
        'submission-queue',
        async (job) => {
            const { submissionId } = job.data
            console.log(`[WORKER] ⭐ Started processing submission: ${submissionId}`)
            console.log(`[WORKER] Job ID: ${job.id}, Data:`, job.data)

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
                                stage: 'running',
                            })
                        )
                        .catch(console.error)

                    redisClient
                        .publish(
                            'submission_updates',
                            JSON.stringify({
                                type: 'submission_status',
                                event: 'SUBMISSION_STATUS',
                                userId: submission.userId,
                                submissionId,
                                problemId: submission.problemId,
                                stage: 'compiling',
                                status: 'running',
                                message: 'Compiling and preparing sandbox...',
                                current: 0,
                            })
                        )
                        .catch(console.error)
                }

                // 2. Fetch problem details for limits
                const problem = await Problem.findById(submission.problemId)
                if (!problem) {
                    throw new Error(`Problem ${submission.problemId} not found`)
                }
                const normalizedTimeLimitMs = Math.max(
                    100,
                    Number.parseInt(problem.timeLimit || '1000', 10) || 1000
                )
                const normalizedMemoryLimitKb = Math.max(
                    16 * 1024,
                    Number.parseInt(problem.memoryLimit || `${256 * 1024}`, 10) || 256 * 1024
                )

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
                let failedCaseNumber = null
                let finalVerdictEmitted = false

                if (submission.type === 'run') {
                    // 🚀 'RUN' Path: Execute once with custom input (Playground - NO JUDGING)
                    console.log(
                        `[WORKER] RUN TYPE: Executing with custom input for submission ${submissionId}`
                    )
                    console.log(
                        `[WORKER] Code length: ${submission.code.length}, Language: ${submission.language}`
                    )

                    // Notify client that execution is starting
                    if (redisClient.isOpen) {
                        redisClient
                            .publish(
                                'submission_updates',
                                JSON.stringify({
                                    type: 'submission_status',
                                    submissionId,
                                    userId: submission.userId,
                                    status: 'running',
                                    message: 'Executing code...',
                                    problemId: submission.problemId,
                                })
                            )
                            .catch(console.error)
                    }

                    const result = await executeCode({
                        code: submission.code,
                        files: submission.files || [],
                        language: submission.language,
                        input: submission.customInput || '',
                        timeLimit: normalizedTimeLimitMs,
                        memoryLimit: normalizedMemoryLimitKb,
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

                    // Notify client that judging is starting
                    if (redisClient.isOpen) {
                        redisClient
                            .publish(
                                'submission_updates',
                                JSON.stringify({
                                    type: 'judging_started',
                                    event: 'JUDGING_STARTED',
                                    submissionId,
                                    userId: submission.userId,
                                    status: 'running',
                                    stage: 'judging_started',
                                    current: 0,
                                    total: totalCount,
                                    message: `Judging started on ${totalCount} test cases`,
                                    problemId: submission.problemId,
                                })
                            )
                            .catch(console.error)

                        redisClient
                            .publish(
                                'submission_updates',
                                JSON.stringify({
                                    type: 'submission_status',
                                    event: 'SUBMISSION_STATUS',
                                    submissionId,
                                    userId: submission.userId,
                                    status: 'running',
                                    stage: 'judging_started',
                                    message: `Starting judge... Running ${totalCount} test cases`,
                                    totalTestCases: totalCount,
                                    current: 0,
                                    total: totalCount,
                                    problemId: submission.problemId,
                                })
                            )
                            .catch(console.error)
                    }

                    const inputs = testCases.map((tc) => tc.input || '')
                    const expectedOutputs = testCases.map((tc) => tc.expectedOutput)

                    let results = await executeMultipleInputs({
                        code: submission.code,
                        files: submission.files || [],
                        language: submission.language,
                        inputs,
                        expectedOutputs,
                        timeLimit: normalizedTimeLimitMs,
                        memoryLimit: normalizedMemoryLimitKb,
                        specialJudgeCode:
                            problem.judgeType === 'special' ? problem.specialJudgeCode : null,
                        onProgress: async (result, i) => {
                            const testCase = testCases[i]
                            console.log(
                                `[WORKER] Processing test case ${i + 1}/${totalCount} with input length: ${testCase.input?.length || 0}`
                            )

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
                            const isPassedCase = resultVerdict === VERDICTS.ACCEPTED
                            const shouldEmitProgress =
                                i === 0 ||
                                !isPassedCase ||
                                i + 1 === totalCount ||
                                (i + 1) % progressEventStride === 0
                            if (redisClient.isOpen && shouldEmitProgress) {
                                const passStatus = isPassedCase ? 'AC' : 'WA'
                                const progressPercent = Math.round(((i + 1) / totalCount) * 100)

                                redisClient
                                    .publish(
                                        'submission_updates',
                                        JSON.stringify({
                                            type: 'test_case_result_batched',
                                            event: 'TEST_CASE_RESULT_BATCHED',
                                            submissionId,
                                            userId: submission.userId,
                                            problemId: submission.problemId,
                                            current: i + 1,
                                            total: totalCount,
                                            caseNumber: i + 1,
                                            status: isPassedCase ? 'PASSED' : 'FAILED',
                                            verdict: resultVerdict,
                                            executionTime: result.executionTime || 0,
                                            memoryUsed: result.memoryUsed || 0,
                                            progress: progressPercent,
                                            message: `Running Case ${i + 1}/${totalCount}...`,
                                        })
                                    )
                                    .catch(console.error)
                            }

                            if (
                                resultVerdict === 'SUCCESS' ||
                                resultVerdict === VERDICTS.ACCEPTED
                            ) {
                                // If it's a success, it means it passed either exact match (default)
                                // or the special judge (inside Docker)
                                passedCount++
                            } else {
                                // Record the first failure, but keep running remaining cases so the
                                // UI can display a complete result set.
                                if (!failedCaseNumber) {
                                    finalVerdict = resultVerdict
                                    firstError = result.error
                                    failedCaseNumber = i + 1
                                }

                                console.log(
                                    `[WORKER] Test case ${i + 1} failed with ${resultVerdict}, continuing evaluation`
                                )

                                // Send per-case failure progress immediately.
                                if (redisClient.isOpen) {
                                    redisClient
                                        .publish(
                                            'submission_updates',
                                            JSON.stringify({
                                                type: 'test_case_failed',
                                                submissionId,
                                                userId: submission.userId,
                                                caseNumber: i + 1,
                                                totalTestCases: totalCount,
                                                verdict: resultVerdict,
                                                message: `❌ Failed at test case ${i + 1}/${totalCount}: ${resultVerdict}`,
                                                problemId: submission.problemId,
                                            })
                                        )
                                        .catch(console.error)
                                }
                            }
                        },
                    })

                    // Fallback to sequential execution if Docker is unavailable
                    if (!results) {
                        for (let i = 0; i < totalCount; i++) {
                            const testCase = testCases[i]
                            console.log(
                                `[WORKER] Processing test case ${i + 1}/${totalCount} with input length: ${testCase.input?.length || 0} (Fallback to executeCode)`
                            )

                            // Execute code (including special judge if enabled)
                            const result = await executeCode({
                                code: submission.code,
                                files: submission.files || [],
                                language: submission.language,
                                input: testCase.input || '',
                                timeLimit: normalizedTimeLimitMs,
                                memoryLimit: normalizedMemoryLimitKb,
                                // Pass special judge details to executor for secure sandboxed execution
                                specialJudgeCode:
                                    problem.judgeType === 'special'
                                        ? problem.specialJudgeCode
                                        : null,
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
                            const isPassedCase = resultVerdict === VERDICTS.ACCEPTED
                            const shouldEmitProgress =
                                i === 0 ||
                                !isPassedCase ||
                                i + 1 === totalCount ||
                                (i + 1) % progressEventStride === 0
                            if (redisClient.isOpen && shouldEmitProgress) {
                                const passStatus = isPassedCase ? 'AC' : 'WA'
                                const progressPercent = Math.round(((i + 1) / totalCount) * 100)

                                redisClient
                                    .publish(
                                        'submission_updates',
                                        JSON.stringify({
                                            type: 'test_case_result_batched',
                                            event: 'TEST_CASE_RESULT_BATCHED',
                                            submissionId,
                                            userId: submission.userId,
                                            problemId: submission.problemId,
                                            current: i + 1,
                                            total: totalCount,
                                            caseNumber: i + 1,
                                            status: isPassedCase ? 'PASSED' : 'FAILED',
                                            verdict: resultVerdict,
                                            executionTime: result.executionTime || 0,
                                            memoryUsed: result.memoryUsed || 0,
                                            progress: progressPercent,
                                            message: `Running Case ${i + 1}/${totalCount}...`,
                                        })
                                    )
                                    .catch(console.error)
                            }

                            if (
                                resultVerdict === 'SUCCESS' ||
                                resultVerdict === VERDICTS.ACCEPTED
                            ) {
                                // If it's a success, it means it passed either exact match (default)
                                // or the special judge (inside Docker)
                                passedCount++
                            } else {
                                // Record the first failure, but continue running all cases.
                                if (!failedCaseNumber) {
                                    finalVerdict = resultVerdict
                                    firstError = result.error
                                    failedCaseNumber = i + 1
                                }

                                console.log(
                                    `[WORKER] Test case ${i + 1} failed with ${resultVerdict}, continuing evaluation`
                                )

                                // Send per-case failure progress immediately.
                                if (redisClient.isOpen) {
                                    redisClient
                                        .publish(
                                            'submission_updates',
                                            JSON.stringify({
                                                type: 'test_case_failed',
                                                submissionId,
                                                userId: submission.userId,
                                                caseNumber: i + 1,
                                                totalTestCases: totalCount,
                                                verdict: resultVerdict,
                                                message: `❌ Failed at test case ${i + 1}/${totalCount}: ${resultVerdict}`,
                                                problemId: submission.problemId,
                                            })
                                        )
                                        .catch(console.error)
                                }
                            }
                        }
                    } else if (
                        testCaseResults.length === 0 &&
                        Array.isArray(results) &&
                        results.length > 0
                    ) {
                        // Handle the case where executeMultipleInputs failed early (e.g. security block or docker creation array)
                        // In this scenario, it returns the error array without invoking the onProgress callback.
                        console.log(
                            `[WORKER] Warning: executeMultipleInputs exited early without evaluating test cases.`
                        )
                        const firstResult = results[0]
                        finalVerdict = firstResult.verdict || VERDICTS.SYSTEM_ERROR
                        firstError = firstResult.error || 'Execution initialization failed'
                        failedCaseNumber = 1

                        // Populate test case results to accurately reflect the failure in the UI
                        for (let i = 0; i < totalCount; i++) {
                            const res = results[i] || firstResult
                            testCaseResults.push({
                                caseNumber: i + 1,
                                testCaseId: testCases[i]?._id,
                                verdict: res.verdict || finalVerdict,
                                time: 0,
                                memory: 0,
                                error: res.error || firstError,
                                isSample: testCases[i]?.isSample || false,
                            })
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
                        eventData.progress = 100
                        if (failedCaseNumber) {
                            eventData.failedCase = failedCaseNumber
                        }
                    }

                    redisClient
                        .publish('submission_updates', JSON.stringify(eventData))
                        .catch(console.error)

                    if (!finalVerdictEmitted) {
                        redisClient
                            .publish(
                                'submission_updates',
                                JSON.stringify({
                                    type: 'final_verdict',
                                    event: 'FINAL_VERDICT',
                                    submissionId,
                                    userId: submission.userId,
                                    problemId: submission.problemId,
                                    status: 'completed',
                                    verdict: finalVerdict,
                                    executionTime: maxTime,
                                    memoryUsed: maxMemory,
                                    failedCase: failedCaseNumber,
                                    current: submission.type === 'submit' ? totalCount : 1,
                                    total: submission.type === 'submit' ? totalCount : 1,
                                    progress: submission.type === 'submit' ? 100 : 100,
                                    error: firstError || '',
                                    closeRoom: true,
                                })
                            )
                            .catch(console.error)
                    }
                }

                // 5. Post-judging tasks run asynchronously so the worker can pick the next queue job faster.
                if (submission.type === 'submit' && finalVerdict !== VERDICTS.SYSTEM_ERROR) {
                    void (async () => {
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
                                await Problem.findByIdAndUpdate(submission.problemId, {
                                    $inc: { acceptedSubmissions: 1 },
                                })
                            }

                            // --- CONTEST SCORING ---
                            if (submission.contestId) {
                                const previousContestAcceptedCount =
                                    await Submission.countDocuments({
                                        userId: submission.userId,
                                        problemId: submission.problemId,
                                        contestId: submission.contestId,
                                        verdict: {
                                            $regex: new RegExp(`^${VERDICTS.ACCEPTED}$`, 'i'),
                                        },
                                        _id: { $ne: submission._id },
                                    })

                                if (previousContestAcceptedCount === 0) {
                                    // ⏱ Calculate Penalty:
                                    // 1. Time from contest start to current AC (in seconds)
                                    // 2. + 20 minutes (1200s) for each failed submission before this AC
                                    const contest = await Contest.findById(
                                        submission.contestId
                                    ).lean()
                                    if (contest) {
                                        const startTime = new Date(contest.startTime).getTime()
                                        const submittedAt = new Date(submission.createdAt).getTime()
                                        const timePenalty = Math.max(
                                            0,
                                            Math.floor((submittedAt - startTime) / 1000)
                                        )

                                        // Count failed submissions for THIS problem by THIS user in THIS contest
                                        const failedSubmissionsCount =
                                            await Submission.countDocuments({
                                                userId: submission.userId,
                                                problemId: submission.problemId,
                                                contestId: submission.contestId,
                                                verdict: {
                                                    $nin: [
                                                        'ACCEPTED',
                                                        'PENDING',
                                                        'RUNNING',
                                                        'SUCCESS',
                                                    ],
                                                },
                                                createdAt: { $lt: submission.createdAt },
                                            })

                                        const totalPenalty =
                                            timePenalty + failedSubmissionsCount * 20 * 60

                                        console.log(
                                            `[WORKER] First AC for problem ${submission.problemId} in contest ${submission.contestId}. ` +
                                                `Score: 100, Penalty: ${totalPenalty}s (Time: ${timePenalty}s, Failed: ${failedSubmissionsCount})`
                                        )

                                        const updatedParticipant = await updateParticipantScore(
                                            submission.contestId,
                                            submission.userId,
                                            {
                                                problemId: submission.problemId,
                                                scoreIncrement: 100,
                                                penaltyIncrement: totalPenalty,
                                            }
                                        )

                                        // Publish idempotent leaderboard update with ABSOLUTE values (not increments)
                                        if (redisClient.isOpen && updatedParticipant) {
                                            redisClient
                                                .publish(
                                                    'submission_updates',
                                                    JSON.stringify({
                                                        type: 'leaderboard_update',
                                                        contestId: submission.contestId,
                                                        userId: submission.userId,
                                                        // Absolute values — frontend replaces state, never increments
                                                        score: updatedParticipant.score,
                                                        solvedCount:
                                                            updatedParticipant.solvedProblemCount,
                                                        penalty: updatedParticipant.penalty,
                                                        solvedProblemIds:
                                                            updatedParticipant.solvedProblemIds,
                                                        updatedAt: new Date().toISOString(),
                                                    })
                                                )
                                                .catch(console.error)
                                        }
                                    }
                                }
                            }
                        }

                        // --- CONTEST RESULT FINALIZATION SIGNAL ---
                        // After processing any contest submission, check if ALL of this user's
                        // submissions are now complete. If so, emit a signal so the Result page
                        // can stop polling and display final data.
                        if (submission.contestId) {
                            const remainingPending = await Submission.countDocuments({
                                contestId: submission.contestId,
                                userId: submission.userId,
                                type: 'submit',
                                status: { $in: ['queued', 'running'] },
                            })

                            console.log(
                                `[WORKER] Contest ${submission.contestId} user ${submission.userId}: ` +
                                    `${remainingPending} pending submission(s) remaining`
                            )

                            if (remainingPending === 0 && redisClient.isOpen) {
                                console.log(
                                    `[WORKER] ✅ All submissions processed for user ${submission.userId} ` +
                                        `in contest ${submission.contestId}. Emitting result_finalized.`
                                )
                                redisClient
                                    .publish(
                                        'submission_updates',
                                        JSON.stringify({
                                            type: 'contest:result_finalized',
                                            contestId: submission.contestId,
                                            userId: submission.userId,
                                            timestamp: new Date().toISOString(),
                                        })
                                    )
                                    .catch(console.error)
                            }
                        }

                        // Invalidate Redis caches.
                        if (redisClient.isOpen) {
                            const keysToInvalidate = [`problem:stats:${submission.problemId}`]
                            await Promise.all(
                                keysToInvalidate.map((key) => redisClient.del(key).catch(() => {}))
                            )
                        }

                        // AI analysis stays decoupled in queue.
                        // if (process.env.ENABLE_AI_ANALYSIS === 'true') {
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
                        } catch (err) {
                            console.error('[WORKER] Failed to dispatch AI analysis job:', err)
                        }
                        // }

                        // Judging notification should not block queue throughput.
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
                    })().catch((err) => {
                        console.error(
                            `[WORKER] Post-processing failed for submission ${submissionId}:`,
                            err
                        )
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

                    redisClient
                        .publish(
                            'submission_updates',
                            JSON.stringify({
                                type: 'final_verdict',
                                event: 'FINAL_VERDICT',
                                userId: erSubmission.userId,
                                submissionId,
                                problemId: erSubmission.problemId,
                                status: 'error',
                                verdict: VERDICTS.SYSTEM_ERROR,
                                error: `Judge Error: ${errorMessage} `,
                                closeRoom: true,
                            })
                        )
                        .catch(console.error)
                }
                throw error
            }
        },
        {
            connection,
            concurrency: workerConcurrency,
        }
    )

    console.log(`[WORKER] Submission worker initialized with concurrency: ${workerConcurrency}`)
    console.log('[WORKER] Worker ready to process jobs from submission-queue')
    console.log('[WORKER] ✅ Worker is now monitoring the submission-queue for incoming jobs...')

    worker.on('active', (job) => {
        console.log(
            `[WORKER] 🔴 ACTIVE: Job ${job.id} is now executing submission ${job.data.submissionId}`
        )
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
