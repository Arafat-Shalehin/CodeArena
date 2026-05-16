import { AIEnginePort } from '../ai-engine.port'
import { getInterviewAIQueue } from '@/lib/queue'

/**
 * DistributedAIAdapter
 * 
 * Implements AIEnginePort using BullMQ for distributed job processing.
 */
export class DistributedAIAdapter extends AIEnginePort {
    async submitChat(data) {
        const queue = getInterviewAIQueue()
        await queue.add('process-chat', data)
    }

    async submitScorecard(data, options = {}) {
        const queue = getInterviewAIQueue()
        await queue.add('process-scorecard', data, options)
    }

    async submitSubmissionAnalysis(data) {
        const queue = getInterviewAIQueue()
        await queue.add('process-submission-analysis', data)
    }

    async cancelSessionJobs(sessionId) {
        try {
            const queue = getInterviewAIQueue()
            // BullMQ: Find jobs for this sessionId and remove them from 'active', 'waiting', 'delayed'
            const jobs = await queue.getJobs(['active', 'waiting', 'delayed'])
            for (const job of jobs) {
                if (job.data?.sessionId?.toString() === sessionId.toString()) {
                    console.log(`[AI Adapter] Cancelling job ${job.id} for session ${sessionId}`)
                    await job.remove()
                }
            }
        } catch (err) {
            console.warn(`[AI Adapter] Failed to clean up BullMQ jobs for ${sessionId}:`, err.message)
        }
    }

    async hasActiveJob(sessionId) {
        try {
            const queue = getInterviewAIQueue()
            const activeJobs = await queue.getActive()
            return activeJobs.some((job) => job.data?.sessionId?.toString() === sessionId.toString())
        } catch (err) {
            console.error('[AI Adapter] Error checking active jobs:', err)
            return false
        }
    }
}
