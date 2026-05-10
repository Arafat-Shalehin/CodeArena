// Node runtime bootstrap for workers, socket server, and schedulers.
import { isWorkerProcess, isSocketProcess, getProcessType } from '@/lib/process-type'
import { registerWorker, setupShutdownHandlers } from '@/lib/worker-manager'

// Initialize global error handlers (must be early to catch all errors)
import '@/lib/global-error-handler'

let globalWorkers = {
    submission: null,
    stats: null,
    ai: null,
    interviewAI: null,
    interviewExecution: null,
    plagiarism: null,
    interviewSummarize: null,
}

function isApiWorkerModeEnabled() {
    return process.env.ENABLE_API_WORKERS === 'true'
}

function shouldStartSocketServer() {
    if (isWorkerProcess()) return false
    if (isSocketProcess()) {
        return process.env.ENABLE_SOCKET_SERVER !== 'false'
    }
    return process.env.ENABLE_SOCKET_SERVER !== 'false'
}

function shouldStartSchedulers() {
    if (isWorkerProcess()) return false
    if (isSocketProcess()) {
        return process.env.ENABLE_API_SCHEDULERS === 'true'
    }
    return process.env.ENABLE_API_SCHEDULERS !== 'false'
}

function shouldStartSystemWorkers(isDev, apiWorkerModeEnabled) {
    if (isWorkerProcess()) return true
    if (apiWorkerModeEnabled) return true
    return isDev && process.env.DISABLE_DEV_SYSTEM_WORKERS !== 'true'
}

function startWorkerOnce(workerName, initFn) {
    if (globalWorkers[workerName]) return
    globalWorkers[workerName] = initFn()
    registerWorker(workerName, globalWorkers[workerName])
}

async function initializeWorkersOnce(isDev, apiWorkerModeEnabled) {
    if (globalThis._workersInitialized) return
    if (globalThis.__workersInitPromise) return globalThis.__workersInitPromise

    globalThis.__workersInitPromise = (async () => {
        console.log(
            `[INSTRUMENTATION] PROCESS_TYPE is ${getProcessType()} (isDev: ${isDev}, apiWorkerMode: ${apiWorkerModeEnabled}). Initializing workers...`
        )

        const { initInterviewAIWorker } = await import('@/services/interviewAI.worker')
        const { initInterviewExecutionWorker } =
            await import('@/services/interviewExecution.worker')
        const { initInterviewSummarizeWorker } =
            await import('@/services/interviewSummarize.worker')

        // Core interview workers (required for interview phase transitions & AI chat)
        startWorkerOnce('interviewAI', initInterviewAIWorker)
        startWorkerOnce('interviewExecution', initInterviewExecutionWorker)
        startWorkerOnce('interviewSummarize', initInterviewSummarizeWorker)

        // In worker process, in dev, or when ENABLE_API_WORKERS=true,
        // run system workers in the current process.
        if (shouldStartSystemWorkers(isDev, apiWorkerModeEnabled)) {
            const { initSubmissionWorker } = await import('@/services/submission.worker')
            const { initStatsWorker } = await import('@/services/stats.worker')
            const { initAIWorker } = await import('@/services/ai.worker')
            const { initPlagiarismWorker } = await import('@/services/plagiarism.worker')

            startWorkerOnce('submission', initSubmissionWorker)
            startWorkerOnce('stats', initStatsWorker)
            startWorkerOnce('ai', initAIWorker)
            startWorkerOnce('plagiarism', initPlagiarismWorker)
        }

        globalThis._workersInitialized = true
        setupShutdownHandlers()
        console.log('[INSTRUMENTATION] Workers initialized')
    })()
        .catch((err) => {
            console.error('[CRITICAL] Failed to initialize Workers:', err.message)
            console.error('[CRITICAL] Error stack:', err.stack)
            throw err
        })
        .finally(() => {
            globalThis.__workersInitPromise = null
        })

    return globalThis.__workersInitPromise
}

async function initializeApiInfrastructureOnce() {
    if (globalThis._schedulerInitialized) return
    if (globalThis.__apiInfraInitPromise) return globalThis.__apiInfraInitPromise

    globalThis.__apiInfraInitPromise = (async () => {
        globalThis._schedulerInitialized = true
        if (shouldStartSocketServer()) {
            console.log(
                `[INSTRUMENTATION] PROCESS_TYPE is ${getProcessType()}. Initializing Socket server...`
            )
            try {
                const { initSocketServer } = await import('@/lib/socket-server')
                await initSocketServer()
                console.log('>>> CodeArena Socket Server Initialized')
            } catch (err) {
                console.error('[CRITICAL] Failed to initialize Socket Server:', err.message)
            }
        } else {
            console.log('[INSTRUMENTATION] Socket server startup is disabled for this process')
        }

        if (shouldStartSchedulers()) {
            // Start Reaction Sync Worker (runs every 5 minutes)
            try {
                const { default: syncReactions } = await import('@/scripts/reactionSyncWorker')
                setInterval(
                    () => {
                        syncReactions().catch((err) => {
                            console.error('[ERROR] Reaction Sync Worker failed:', err.message)
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
        } else {
            console.log('[INSTRUMENTATION] API schedulers are disabled for this process')
        }
    })().finally(() => {
        globalThis.__apiInfraInitPromise = null
    })

    return globalThis.__apiInfraInitPromise
}

export async function registerNodeInstrumentation() {
    console.log('[INSTRUMENTATION] register() called')
    console.log('[INSTRUMENTATION] NEXT_RUNTIME:', process.env.NEXT_RUNTIME)
    console.log('[INSTRUMENTATION] PROCESS_TYPE:', getProcessType())

    const isBuild =
        process.env.NEXT_PHASE === 'phase-production-build' ||
        process.env.SKIP_WORKER_INIT === 'true'

    if (isBuild) {
        console.log('[INSTRUMENTATION] Skipping worker initialization during build phase.')
        return
    }

    const isDev = process.env.NODE_ENV === 'development'
    const apiWorkerModeEnabled = isApiWorkerModeEnabled()

    if (isWorkerProcess() || (!isSocketProcess() && (isDev || apiWorkerModeEnabled))) {
        if (apiWorkerModeEnabled && !isWorkerProcess()) {
            console.log(
                '[INSTRUMENTATION] ENABLE_API_WORKERS=true -> starting workers in API process'
            )
        }
        await initializeWorkersOnce(isDev, apiWorkerModeEnabled)
    }

    if (!isWorkerProcess() && !globalThis._schedulerInitialized) {
        await initializeApiInfrastructureOnce()
    }
}
