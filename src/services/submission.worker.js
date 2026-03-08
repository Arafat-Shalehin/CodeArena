import { Worker } from 'bullmq'
import { connection } from '@/lib/queue'
import { User } from '@/models/User.models'
import { Submission } from '@/models/Submission.models'
import { Problem } from '@/models/Problem.models'
import { TestCase } from '@/models/TestCase.models'
import { executeCode } from '@/lib/docker/executor'
import { redisClient } from '@/lib/redis'
import { syncUserStats } from '@/services/user.service'

/**
 * Worker to process code submissions
 */
export function initSubmissionWorker() {
    const worker = new Worker(
        'submission-queue',
        async (job) => {
            const { submissionId } = job.data

            try {
                // 1. Fetch submission
                const submission = await Submission.findById(submissionId)
                if (!submission) {
                    throw new Error(`Submission ${submissionId} not found`)
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
                let finalVerdict = 'accepted'
                let firstError = null

                if (totalCount === 0) {
                    finalVerdict = 'error'
                    firstError = 'No test cases found for this problem.'
                } else {
                    for (let i = 0; i < totalCount; i++) {
                        const testCase = testCases[i]

                        const result = await executeCode({
                            code: submission.code,
                            files: submission.files || [],
                            language: submission.language,
                            input: testCase.input || '',
                            timeLimit: problem.timeLimit,
                            memoryLimit: problem.memoryLimit,
                        })

                        maxTime = Math.max(maxTime, result.executionTime || 0)
                        maxMemory = Math.max(maxMemory, result.memoryUsed || 0)

                        // 4. Update individual test case result
                        const caseResult = {
                            testCaseId: testCase._id,
                            verdict: result.verdict.toLowerCase(),
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

                        if (result.verdict === 'SUCCESS') {
                            if (problem.judgeType === 'special') {
                                // ⚖️ Special Judge Logic
                                // For now, we'll use a simple eval-based judge for demonstration.
                                // In production, this should be executed in a separate sandbox.
                                try {
                                    const judgeFn = new Function(
                                        'input',
                                        'output',
                                        'expected',
                                        problem.specialJudgeCode
                                    )
                                    const isCorrect = judgeFn(
                                        testCase.input,
                                        result.output,
                                        testCase.expectedOutput
                                    )

                                    if (isCorrect) {
                                        passedCount++
                                    } else {
                                        finalVerdict = 'wrong_answer'
                                        break
                                    }
                                } catch (judgeError) {
                                    console.error('Special Judge Error:', judgeError)
                                    finalVerdict = 'system_error'
                                    firstError = 'Special judge execution failed.'
                                    break
                                }
                            } else {
                                // 🏁 Exact Match Logic
                                // Normalize CRLF → LF (Windows Docker may produce \r\n)
                                const normalize = (s) => (s ?? '').replace(/\r\n/g, '\n').trim()
                                const actualOutput = normalize(result.output)
                                const expectedOutput = normalize(testCase.expectedOutput)

                                console.log(
                                    `[JUDGE] Case ${i + 1} | actual: ${JSON.stringify(actualOutput)} | expected: ${JSON.stringify(expectedOutput)} | match: ${actualOutput === expectedOutput}`
                                )

                                if (actualOutput === expectedOutput) {
                                    passedCount++
                                } else {
                                    finalVerdict = 'wrong_answer'
                                    break
                                }
                            }
                        } else {
                            finalVerdict = result.verdict.toLowerCase()
                            firstError = result.error
                            break // Stop at first non-success verdict
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
                        error: firstError, // You might want to add this to the Submission model
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

                // 5. Update Problem stats if result is a valid attempt (not a judge error)
                if (finalVerdict !== 'system_error' && finalVerdict !== 'error') {
                    const isAccepted = finalVerdict === 'accepted'

                    await Problem.findByIdAndUpdate(submission.problemId, {
                        $inc: {
                            acceptedSubmissions: isAccepted ? 1 : 0,
                            totalSubmissions: 1,
                        },
                    })

                    // 6. Update User Performance Stats by Tag (Keep this incremental for efficiency/legacy)
                    if (problem.tags && problem.tags.length > 0) {
                        const userUpdate = { $inc: {}, $set: {} }

                        problem.tags.forEach((tag) => {
                            const mapKey = 'performanceStats.' + tag
                            userUpdate.$inc[mapKey + '.attempted'] = 1
                            userUpdate.$set[mapKey + '.lastAttemptDate'] = new Date()

                            if (isAccepted) {
                                userUpdate.$inc[mapKey + '.solved'] = 1
                                userUpdate.$inc[mapKey + '.recentSolveStreak'] = 1
                            } else {
                                userUpdate.$inc[mapKey + '.failed'] = 1
                                userUpdate.$set[mapKey + '.recentSolveStreak'] = 0
                            }
                        })

                        // Check if this problem was already attempted for these tags
                        const existingUser = await User.findById(submission.userId).select(
                            'stats.attemptedProblems'
                        )
                        const isFirstAttempt = !existingUser?.stats?.attemptedProblems?.some(
                            (id) => id.toString() === submission.problemId.toString()
                        )

                        if (isFirstAttempt) {
                            problem.tags.forEach((tag) => {
                                userUpdate.$inc['performanceStats.' + tag + '.uniqueProblems'] = 1
                            })
                        }

                        await User.findByIdAndUpdate(submission.userId, userUpdate)
                    }

                    // 7. Synchronize Global Stats (Solved Count, Distribution, Calendar)
                    // This is our single source of truth fix.
                    await syncUserStats(submission.userId)
                }

                return { verdict: finalVerdict, passedCount, totalCount }
            } catch (error) {
                console.error(`CRITICAL: Error processing submission ${submissionId}: `, error)
                // Capture the exact error message to help debugging
                const errorMessage = error.message || 'Unknown system error'

                const erSubmission = await Submission.findByIdAndUpdate(
                    submissionId,
                    {
                        status: 'error',
                        verdict: 'system_error',
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
                                verdict: 'system_error',
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
            concurrency: 2, // Adjust based on Docker capacity
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
