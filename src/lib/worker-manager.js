/**
 * Central Worker Manager
 *
 * Tracks all active workers and provides graceful shutdown.
 * Prevents memory leaks from orphaned workers.
 */

const workers = new Map()
let isShuttingDown = false
let shutdownTimeout = null

function getNodeProcess() {
    const proc = globalThis?.['process']
    if (!proc || !proc.versions || !proc.versions.node) {
        return null
    }
    return proc
}

/**
 * Register a worker in the central registry.
 * @param {string} name
 * @param {any} worker
 */
export function registerWorker(name, worker) {
    if (!name || !worker) {
        throw new Error('Worker name and instance are required')
    }

    if (workers.has(name)) {
        console.warn(`[WorkerManager] Worker '${name}' already registered. Closing old instance.`)
        const oldWorker = workers.get(name)
        oldWorker.close().catch((err) => {
            console.error(`[WorkerManager] Failed to close old '${name}' worker:`, err.message)
        })
    }

    workers.set(name, worker)
    console.log(`[WorkerManager] Registered worker '${name}' (total: ${workers.size})`)
}

/**
 * Unregister a worker.
 * @param {string} name
 */
export function unregisterWorker(name) {
    if (workers.has(name)) {
        workers.delete(name)
        console.log(`[WorkerManager] Unregistered worker '${name}' (remaining: ${workers.size})`)
    }
}

/**
 * @returns {Map<string, any>}
 */
export function getWorkers() {
    return new Map(workers)
}

/**
 * @param {string} name
 * @returns {any|null}
 */
export function getWorker(name) {
    return workers.get(name) || null
}

/**
 * @returns {boolean}
 */
export function hasActiveWorkers() {
    return workers.size > 0
}

/**
 * @returns {string[]}
 */
export function getWorkerNames() {
    return Array.from(workers.keys())
}

/**
 * Graceful shutdown of all workers.
 * @param {number} timeoutMs
 */
export async function gracefulShutdown(timeoutMs = 30000) {
    if (isShuttingDown) {
        console.log('[WorkerManager] Shutdown already in progress, skipping...')
        return
    }

    isShuttingDown = true
    console.log(`\n[WorkerManager] Initiating graceful shutdown (${timeoutMs}ms timeout)...`)

    const proc = getNodeProcess()
    if (proc && typeof proc.exit === 'function') {
        shutdownTimeout = setTimeout(() => {
            console.error('[WorkerManager] Shutdown timeout exceeded. Forcing exit.')
            proc.exit(1)
        }, timeoutMs)
    }

    const workerEntries = Array.from(workers.entries())
    console.log(`[WorkerManager] Closing ${workerEntries.length} worker(s)...`)

    const closurePromises = workerEntries.map(async ([name, worker]) => {
        try {
            console.log(`[WorkerManager] Closing '${name}' worker...`)
            await worker.close()
            workers.delete(name)
            console.log(`[WorkerManager] Closed '${name}' worker`)
        } catch (error) {
            console.error(
                `[WorkerManager] Error closing '${name}' worker:`,
                error?.message || error
            )
        }
    })

    const results = await Promise.allSettled(closurePromises)
    const failed = results.filter((r) => r.status === 'rejected').length

    if (failed > 0) {
        console.warn(`[WorkerManager] ${failed} worker(s) failed to close cleanly`)
    }

    if (shutdownTimeout) {
        clearTimeout(shutdownTimeout)
        shutdownTimeout = null
    }

    console.log('[WorkerManager] All workers closed. Safe to exit.')
}

/**
 * Setup signal handlers for graceful shutdown.
 */
export function setupShutdownHandlers() {
    const proc = getNodeProcess()

    if (!proc) {
        console.log('[WorkerManager] Skipping signal handlers (not Node.js environment)')
        return
    }

    const signals = ['SIGINT', 'SIGTERM', 'SIGHUP']

    signals.forEach((signal) => {
        const onSignal = proc.on
        if (typeof onSignal !== 'function') return

        onSignal.call(proc, signal, async () => {
            console.log(`\n[WorkerManager] Received ${signal} signal`)
            await gracefulShutdown()
            if (typeof proc.exit === 'function') {
                proc.exit(0)
            }
        })
    })

    console.log('[WorkerManager] Shutdown handlers installed for:', signals.join(', '))
}

/**
 * Force close a worker.
 * @param {string} name
 */
export async function forceCloseWorker(name) {
    const worker = workers.get(name)
    if (!worker) {
        console.warn(`[WorkerManager] Worker '${name}' not found`)
        return
    }

    try {
        console.log(`[WorkerManager] Force closing '${name}' worker...`)
        await worker.close()
        workers.delete(name)
        console.log(`[WorkerManager] Force closed '${name}' worker`)
    } catch (error) {
        console.error(`[WorkerManager] Error force closing '${name}':`, error?.message)
        workers.delete(name)
    }
}

/**
 * @returns {{totalWorkers:number, activeWorkers:string[], isShuttingDown:boolean}}
 */
export function getWorkerStats() {
    return {
        totalWorkers: workers.size,
        activeWorkers: getWorkerNames(),
        isShuttingDown,
    }
}

export default {
    registerWorker,
    unregisterWorker,
    getWorkers,
    getWorker,
    hasActiveWorkers,
    getWorkerNames,
    gracefulShutdown,
    setupShutdownHandlers,
    forceCloseWorker,
    getWorkerStats,
}
