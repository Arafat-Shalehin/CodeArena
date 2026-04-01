import { Worker } from 'bullmq'
import { connection } from '@/lib/queue'
import { Submission } from '@/models/Submission.models'
import { analyzeSubmissionCode } from '@/lib/ai/groqClient'

export function initAIWorker() {
    const worker = new Worker(
        'ai-analysis-queue',
        async (job) => {
            const {
                submissionId,
                userId,
                problemId,
                code,
                language,
                problemTitle,
                verdict,
                executionTime,
                memoryUsed,
            } = job.data

            try {
                // if (process.env.ENABLE_AI_ANALYSIS !== 'true') return { skipped: true }

                console.log(`[AI WORKER] Analyzing submission ${submissionId}`)

                const aiFeedback = await analyzeSubmissionCode({
                    code,
                    language,
                    problemTitle,
                    verdict,
                    executionTime,
                    memoryUsed,
                })

                if (aiFeedback) {
                    await Submission.findByIdAndUpdate(submissionId, { aiFeedback })
                    console.log(`[AI WORKER] AI feedback saved for ${submissionId}`)

                    const { sendNotification } = await import('@/services/notification.service')
                    await sendNotification({
                        recipientId: userId,
                        type: 'ai_insight',
                        message: `AI Insights are ready for your solution to "${problemTitle}"`,
                        link: `/problems/${problemId}?tab=results&submission=${submissionId}`,
                        metadata: { submissionId, problemId },
                    })
                }

                return { success: true }
            } catch (error) {
                console.error(`[AI WORKER] Error analyzing submission ${submissionId}:`, error)
                throw error
            }
        },
        { connection, concurrency: 1 }
    )

    worker.on('failed', (job, err) => {
        console.error(
            `[AI WORKER] Job failed for submission ${job.data?.submissionId}:`,
            err.message
        )
    })

    return worker
}
