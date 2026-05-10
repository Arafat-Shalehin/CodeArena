/**
 * ExecutionPort
 * 
 * Abstract base class for execution adapters.
 * Defines the contract for submitting code for evaluation.
 */
export class ExecutionPort {
    /**
     * Submit a submission for evaluation.
     * @param {string} submissionId - The ID of the submission record.
     * @returns {Promise<void>}
     */
    async submit(submissionId) {
        // This is an abstract method. The implementation (e.g., DistributedExecutionAdapter)
        // will use the submissionId to queue the task for the specific worker.
        throw new Error('Method ExecutionPort.submit() must be implemented');
    }

    /**
     * Get the number of jobs waiting in the execution queue.
     * @returns {Promise<number>}
     */
    async getWaitingCount() {
        return 0;
    }
}
