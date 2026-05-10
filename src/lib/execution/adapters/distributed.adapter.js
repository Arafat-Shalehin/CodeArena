import { ExecutionPort } from '../execution.port';
import { getSubmissionQueue } from '@/lib/queue';

/**
 * DistributedExecutionAdapter
 * 
 * Implements ExecutionPort using BullMQ for distributed task processing.
 */
export class DistributedExecutionAdapter extends ExecutionPort {
    async submit(submissionId) {
        console.log(`[EXECUTION ADAPTER] Submitting via Distributed (BullMQ): ${submissionId}`);
        
        try {
            const queue = getSubmissionQueue();
            await queue.add('process-submission', {
                submissionId: submissionId,
            });
            
            console.log(`[EXECUTION ADAPTER] Job added to BullMQ successfully`);
        } catch (error) {
            console.error(`[EXECUTION ADAPTER] Failed to add submission to queue:`, error);
            throw error;
        }
    }

    async getWaitingCount() {
        try {
            const queue = getSubmissionQueue();
            return await queue.getWaitingCount();
        } catch (error) {
            console.warn('[EXECUTION ADAPTER] Failed to read queue waiting count:', error?.message);
            return 0;
        }
    }
}
