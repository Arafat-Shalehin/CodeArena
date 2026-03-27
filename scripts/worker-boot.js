console.log('[WorkerBoot] Starting CodeArena worker process...')

async function startWorkers() {
    const { initSubmissionWorker } = await import('@/services/submission.worker.js')
    const { initStatsWorker } = await import('@/services/stats.worker.js')
    const { initAIWorker } = await import('@/services/ai.worker.js')
    const { initInterviewAIWorker } = await import('@/services/interviewAI.worker.js')
    const { initInterviewExecutionWorker } = await import('@/services/interviewExecution.worker.js')
    const { initPlagiarismWorker } = await import('@/services/plagiarism.worker.js')
    const { initInterviewSummarizeWorker } = await import('@/services/interviewSummarize.worker.js')

    const workers = {
        submission: initSubmissionWorker(),
        stats: initStatsWorker(),
        ai: initAIWorker(),
        interviewAI: initInterviewAIWorker(),
        interviewExecution: initInterviewExecutionWorker(),
        plagiarism: initPlagiarismWorker(),
        interviewSummarize: initInterviewSummarizeWorker(),
    }

    console.log('[WorkerBoot] Workers initialized successfully.')

    const shutdown = async (signal) => {
        console.log(`[WorkerBoot] Received ${signal}. Shutting down workers...`)

        await Promise.all(
            Object.entries(workers).map(async ([name, worker]) => {
                try {
                    await worker.close()
                    console.log(`[WorkerBoot] Closed ${name} worker`)
                } catch (error) {
                    console.error(`[WorkerBoot] Failed to close ${name} worker:`, error.message)
                }
            })
        )

        process.exit(0)
    }

    process.on('SIGINT', () => shutdown('SIGINT'))
    process.on('SIGTERM', () => shutdown('SIGTERM'))
}

startWorkers().catch((error) => {
    console.error('[WorkerBoot] Failed to initialize workers:', error.message)
    console.error(error.stack)
    process.exit(1)
})
