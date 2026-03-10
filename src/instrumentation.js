export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { initSubmissionWorker } = await import('@/services/submission.worker')
        const { initStatsWorker } = await import('@/services/stats.worker')
        const { initAIWorker } = await import('@/services/ai.worker')

        initSubmissionWorker()
        initStatsWorker()
        initAIWorker()
        console.log('>>> CodeArena Workers Initialized (Submission, Stats, AI)')

        // Start Reaction Sync Worker (runs every 5 minutes)
        const { default: syncReactions } = await import('@/scripts/reactionSyncWorker')
        setInterval(
            () => {
                syncReactions().catch(console.error)
            },
            5 * 60 * 1000
        )
        console.log('>>> CodeArena Reaction Sync Scheduler Initialized')

        // Start Contest Reminder Worker (runs every 5 minutes)
        const { checkUpcomingContests } = await import('@/services/notification.service')
        setInterval(
            () => {
                checkUpcomingContests().catch(console.error)
            },
            5 * 60 * 1000
        )
        console.log('>>> CodeArena Contest Reminder Scheduler Initialized')
    }
}
