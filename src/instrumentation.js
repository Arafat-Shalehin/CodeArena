export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { initSubmissionWorker } = await import('@/services/submission.worker')
        initSubmissionWorker()
        console.log('>>> CodeArena Submission Worker Initialized')

        // Start Reaction Sync Worker (runs every 5 minutes)
        const { default: syncReactions } = await import('@/scripts/reactionSyncWorker')
        setInterval(
            () => {
                syncReactions().catch(console.error)
            },
            5 * 60 * 1000
        )
        console.log('>>> CodeArena Reaction Sync Scheduler Initialized')
    }
}
