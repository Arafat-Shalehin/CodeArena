import { Worker } from 'bullmq'
import { connection } from '@/lib/queue'
import { Submission } from '@/models/Submission.models'
import { Problem } from '@/models/Problem.models'
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

                // 3. Execute code for each test case
                let passedCount = 0
                const totalCount = problem.testCases?.length || 0
                let maxTime = 0
                let maxMemory = 0
                let finalVerdict = 'accepted'
                let firstError = null

                if (totalCount === 0) {
                    finalVerdict = 'error'
                    firstError = 'No test cases found for this problem.'
                } else {
                    for (let i = 0; i < totalCount; i++) {
                        const testCase = problem.testCases[i]

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
                            // Compare output (trimmed)
                            const actualOutput = result.output?.trim()
                            const expectedOutput = testCase.output?.trim()

                            if (actualOutput === expectedOutput) {
                                passedCount++
                            } else {
                                finalVerdict = 'wrong_answer'
                                break // Stop at first failure
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
