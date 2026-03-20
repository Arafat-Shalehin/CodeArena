import { Worker } from 'bullmq'
import { connection } from '@/lib/queue'
import { checkSubmissionPlagiarism } from '@/services/plagiarism.service'

/**
 * Worker to process plagiarism detection jobs.
 * Configuration:
 * - Queue name: 'plagiarism-checks'
 * - Concurrency: 3 (protective of MongoDB load)
 * - Rate limit: 10 jobs per second
 */
export function initPlagiarismWorker() {
    const worker = new Worker(
        'plagiarism-checks',
        async (job) => {
            const { submissionId } = job.data
            console.log(`[PLAGIARISM WORKER] Checking submission ${submissionId}`)

            try {
                // The service handles all idempotency and comparison logic
                await checkSubmissionPlagiarism(submissionId)
                return { success: true }
            } catch (error) {
                console.error(
                    `[PLAGIARISM WORKER] Error in job ${job.id} for submission ${submissionId}:`,
                    error.message
                )
                // Rethrow to allow BullMQ retry logic to operate
                throw error
            }
        },
        {
            connection,
            concurrency: 3,
            limiter: {
                max: 10,
                duration: 1000,
            },
        }
    )

    worker.on('failed', (job, err) => {
        console.error(
            `[PLAGIARISM WORKER] Job failed for submission ${job.data?.submissionId}:`,
            err.message
        )
    })

    worker.on('completed', (job) => {
        console.log(`[PLAGIARISM WORKER] Completed check for submission ${job.data?.submissionId}`)
    })

    return worker
}
