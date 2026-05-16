/**
 * AIEnginePort
 * 
 * Abstract base class for AI engine invocation adapters.
 * Defines the contract for initiating AI processing jobs.
 */
export class AIEnginePort {
    /**
     * Submit a chat message for AI processing.
     * @param {Object} data - Chat data (sessionId, userId, content, phase, messageId)
     * @returns {Promise<void>}
     */
    async submitChat(data) {
        throw new Error('Method AIEnginePort.submitChat() must be implemented')
    }

    /**
     * Submit a request for scorecard generation.
     * @param {Object} data - Scorecard data (sessionId, userId)
     * @param {Object} [options] - Optional processing options (e.g., attempts, backoff)
     * @returns {Promise<void>}
     */
    async submitScorecard(data, options = {}) {
        throw new Error('Method AIEnginePort.submitScorecard() must be implemented')
    }

    /**
     * Submit a code submission for AI analysis.
     * @param {Object} data - Submission data (sessionId, userId, submissionVerdict, code, language)
     * @returns {Promise<void>}
     */
    async submitSubmissionAnalysis(data) {
        throw new Error('Method AIEnginePort.submitSubmissionAnalysis() must be implemented')
    }

    /**
     * Cancel any pending AI jobs for a given session.
     * @param {string} sessionId - The session ID
     * @returns {Promise<void>}
     */
    async cancelSessionJobs(sessionId) {
        throw new Error('Method AIEnginePort.cancelSessionJobs() must be implemented')
    }

    /**
     * Check if an active AI job exists for a given session.
     * @param {string} sessionId - The session ID
     * @returns {Promise<boolean>}
     */
    async hasActiveJob(sessionId) {
        throw new Error('Method AIEnginePort.hasActiveJob() must be implemented')
    }
}
