export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        try {
            const { initSubmissionWorker } = await import('@/services/submission.worker')
            const { initStatsWorker } = await import('@/services/stats.worker')
            const { initAIWorker } = await import('@/services/ai.worker')
            const { initInterviewAIWorker } = await import('@/services/interviewAI.worker')

            initSubmissionWorker()
            initStatsWorker()
            initAIWorker()
            initInterviewAIWorker()
            console.log('>>> CodeArena Workers Initialized (Submission, Stats, AI, InterviewAI)')
        } catch (err) {
            console.error('[CRITICAL] Failed to initialize Workers:', err.message)
        }

        // Start Reaction Sync Worker (runs every 5 minutes)
        try {
            const { default: syncReactions } = await import('@/scripts/reactionSyncWorker')
            setInterval(
                () => {
                    syncReactions().catch((err) => {
                        console.error('[ERROR] Reaction Sync Worker failed:', err.message)
                        // Error is caught and logged, worker continues running
                    })
                },
                5 * 60 * 1000
            )
            console.log('>>> CodeArena Reaction Sync Scheduler Initialized')
        } catch (err) {
            console.error('[CRITICAL] Failed to initialize Reaction Sync Scheduler:', err.message)
        }

        // Start Contest Reminder Worker (runs every 5 minutes)
        try {
            const { checkUpcomingContests } = await import('@/services/notification.service')
            setInterval(
                () => {
                    checkUpcomingContests().catch((err) => {
                        console.error('[ERROR] Contest Reminder Worker failed:', err.message)
                        // Error is caught and logged, worker continues running
                    })
                },
                5 * 60 * 1000
            )
            console.log('>>> CodeArena Contest Reminder Scheduler Initialized')
        } catch (err) {
            console.error(
                '[CRITICAL] Failed to initialize Contest Reminder Scheduler:',
                err.message
            )
        }
    }
}
