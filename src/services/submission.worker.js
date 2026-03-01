import { Worker } from 'bullmq'
import { connection } from '@/lib/queue'
import { User } from '@/models/User.models'
import { Submission } from '@/models/Submission.models'
import { Problem } from '@/models/Problem.models'
import { TestCase } from '@/models/TestCase.models'
import { executeCode } from '@/lib/docker/executor'
import { logger } from '@/lib/logger'

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

                // 2. Fetch problem details for limits
                const problem = await Problem.findById(submission.problemId)
                if (!problem) {
                    throw new Error(`Problem ${submission.problemId} not found`)
                }

                // 3. Fetch all test cases for the problem
                const testCases = await TestCase.find({ problemId: submission.problemId }).sort({
                    order: 1,
                })
                const totalCount = testCases.length

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
                            language: submission.language,
                            input: testCase.input || '',
                            timeLimit: problem.timeLimit,
                            memoryLimit: problem.memoryLimit,
                        })

                        maxTime = Math.max(maxTime, result.executionTime || 0)
                        maxMemory = Math.max(maxMemory, result.memoryUsed || 0)

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
                                const actualOutput = result.output?.trim()
                                const expectedOutput = testCase.expectedOutput?.trim()

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
                const updates = {
                    status: 'completed',
                    verdict: finalVerdict,
                    executionTime: maxTime,
                    memoryUsed: maxMemory,
                    error: firstError, // You might want to add this to the Submission model
                }

                await Submission.findByIdAndUpdate(submissionId, updates)

                // 5. Update Problem stats if accepted
                if (finalVerdict === 'accepted') {
                    await Problem.findByIdAndUpdate(submission.problemId, {
                        $inc: { acceptedSubmissions: 1, totalSubmissions: 1 },
                    })
                } else {
                    await Problem.findByIdAndUpdate(submission.problemId, {
                        $inc: { totalSubmissions: 1 },
                    })
                }

                // 6. Update User unique stats
                const userUpdate = {
                    $addToSet: { 'stats.attemptedProblems': submission.problemId },
                }
                if (finalVerdict === 'accepted') {
                    userUpdate.$addToSet['stats.solvedProblems'] = submission.problemId
                    userUpdate.$inc = { 'stats.accepted': 1 }
                }
                userUpdate.$inc = { ...userUpdate.$inc, 'stats.totalSubmissions': 1 }

                await User.findByIdAndUpdate(submission.userId, userUpdate)

                return { verdict: finalVerdict, passedCount, totalCount }
            } catch (error) {
                console.error(`Error processing submission ${submissionId}:`, error)
                await Submission.findByIdAndUpdate(submissionId, {
                    status: 'error',
                    verdict: 'system_error',
                })
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
        console.error(`Submission ${job.data.submissionId} failed:`, err)
    })

    return worker
}
