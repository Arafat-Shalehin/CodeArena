export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { initSubmissionWorker } = await import('@/services/submission.worker')
        initSubmissionWorker()
        console.log('>>> CodeArena Submission Worker Initialized')
    }
}
