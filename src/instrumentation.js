export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        try {
            const { initSubmissionWorker } = await import('@/services/submission.worker')
            initSubmissionWorker()
            console.log('>>> CodeArena Submission Worker Initialized')
        } catch (err) {
            console.error('[CRITICAL] Failed to initialize Submission Worker:', err.message)
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
