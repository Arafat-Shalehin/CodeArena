// Store workers globally to prevent garbage collection
import { isWorkerProcess, getProcessType } from '@/lib/process-type'

let globalWorkers = {
    submission: null,
    stats: null,
    ai: null,
    interviewAI: null,
    interviewExecution: null,
    plagiarism: null,
    interviewSummarize: null,
}

export async function register() {
    console.log('[INSTRUMENTATION] register() called')
    console.log('[INSTRUMENTATION] NEXT_RUNTIME:', process.env.NEXT_RUNTIME)
    console.log('[INSTRUMENTATION] PROCESS_TYPE:', getProcessType())

    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const isBuild =
            process.env.NEXT_PHASE === 'phase-production-build' ||
            process.env.SKIP_WORKER_INIT === 'true'

        if (isBuild) {
            console.log('[INSTRUMENTATION] Skipping worker initialization during build phase.')
            return
        }

        const isDev = process.env.NODE_ENV === 'development'

        if (isWorkerProcess() || isDev) {
            console.log(
                `[INSTRUMENTATION] PROCESS_TYPE is ${getProcessType()} (isDev: ${isDev}). Initializing workers...`
            )
            try {
                const { initInterviewAIWorker } = await import('@/services/interviewAI.worker')
                const { initInterviewExecutionWorker } =
                    await import('@/services/interviewExecution.worker')
                const { initInterviewSummarizeWorker } =
                    await import('@/services/interviewSummarize.worker')

                // Core interview workers (Required for phase transitions & AI chat)
                console.log('[INSTRUMENTATION] Starting Interview Workers...')
                if (globalWorkers.interviewAI) await globalWorkers.interviewAI.close()
                globalWorkers.interviewAI = initInterviewAIWorker()

                if (globalWorkers.interviewExecution) await globalWorkers.interviewExecution.close()
                globalWorkers.interviewExecution = initInterviewExecutionWorker()

                if (globalWorkers.interviewSummarize) await globalWorkers.interviewSummarize.close()
                globalWorkers.interviewSummarize = initInterviewSummarizeWorker()

                // Only start massive system workers if specifically requested via PROCESS_TYPE=WORKER
                if (isWorkerProcess()) {
                    console.log(
                        '[INSTRUMENTATION] System workers requested via PROCESS_TYPE=WORKER. Starting Submission, Stats, AI, Plagiarism...'
                    )
                    const { initSubmissionWorker } = await import('@/services/submission.worker')
                    const { initStatsWorker } = await import('@/services/stats.worker')
                    const { initAIWorker } = await import('@/services/ai.worker')
                    const { initPlagiarismWorker } = await import('@/services/plagiarism.worker')

                    if (globalWorkers.submission) await globalWorkers.submission.close()
                    globalWorkers.submission = initSubmissionWorker()

                    if (globalWorkers.stats) await globalWorkers.stats.close()
                    globalWorkers.stats = initStatsWorker()

                    if (globalWorkers.ai) await globalWorkers.ai.close()
                    globalWorkers.ai = initAIWorker()

                    if (globalWorkers.plagiarism) await globalWorkers.plagiarism.close()
                    globalWorkers.plagiarism = initPlagiarismWorker()
                }

                globalThis._workersInitialized = true
                console.log(
                    '>>> CodeArena Interview Workers Initialized (AI, Execution, Summarize)'
                )
            } catch (err) {
                console.error('[CRITICAL] Failed to initialize Workers:', err.message)
                console.error('[CRITICAL] Error stack:', err.stack)
            }
        }

        if (!isWorkerProcess() && !globalThis._schedulerInitialized) {
            globalThis._schedulerInitialized = true
            console.log('[INSTRUMENTATION] PROCESS_TYPE is API. Initializing Socket server...')
            try {
                const { initSocketServer } = await import('@/lib/socket-server')
                await initSocketServer()
                console.log('>>> CodeArena Socket Server Initialized')
            } catch (err) {
                console.error('[CRITICAL] Failed to initialize Socket Server:', err.message)
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
                console.error(
                    '[CRITICAL] Failed to initialize Reaction Sync Scheduler:',
                    err.message
                )
            }

            // Start Contest Reminder Worker (runs every 5 minutes)
            try {
                const { checkUpcomingContests } = await import('@/services/notification.service')
                setInterval(
                    () => {
                        checkUpcomingContests().catch((err) => {
                            console.error('[ERROR] Contest Reminder Worker failed:', err.message)
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
}
