/**
 * Central Worker Manager
 *
 * Tracks all active workers and provides graceful shutdown
 * Prevents memory leaks from orphaned workers
 *
 * Usage:
 *   import { registerWorker, getWorkers, gracefulShutdown } from '@/lib/worker-manager'
 *
 *   const worker = new Worker(...)
 *   registerWorker('submission', worker)
 */

const workers = new Map()
let isShuttingDown = false
let shutdownTimeout = null

/**
 * Register a worker in the central registry
 * @param {string} name - Unique worker name (e.g., 'submission', 'stats')
 * @param {Worker} worker - BullMQ Worker instance
 * @returns {void}
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
    console.log(`[WorkerManager] ✅ Registered worker '${name}' (total: ${workers.size})`)
}

/**
 * Unregister a worker (e.g., after shutdown)
 * @param {string} name - Worker name
 * @returns {void}
 */
export function unregisterWorker(name) {
    if (workers.has(name)) {
        workers.delete(name)
        console.log(`[WorkerManager] Unregistered worker '${name}' (remaining: ${workers.size})`)
    }
}

/**
 * Get all registered workers
 * @returns {Map<string, Worker>}
 */
export function getWorkers() {
    return new Map(workers)
}

/**
 * Get a specific worker by name
 * @param {string} name - Worker name
 * @returns {Worker|null}
 */
export function getWorker(name) {
    return workers.get(name) || null
}

/**
 * Check if any workers are registered
 * @returns {boolean}
 */
export function hasActiveWorkers() {
    return workers.size > 0
}

/**
 * Get list of registered worker names
 * @returns {string[]}
 */
export function getWorkerNames() {
    return Array.from(workers.keys())
}

/**
 * Graceful shutdown of all workers
 * @param {number} timeoutMs - Max time to wait for workers to close (default: 30s)
 * @returns {Promise<void>}
 */
export async function gracefulShutdown(timeoutMs = 30000) {
    if (isShuttingDown) {
        console.log('[WorkerManager] Shutdown already in progress, skipping...')
        return
    }

    isShuttingDown = true
    console.log(`\n[WorkerManager] 🛑 Initiating graceful shutdown (${timeoutMs}ms timeout)...`)

    // Set hard timeout to force exit if graceful shutdown hangs
    shutdownTimeout = setTimeout(() => {
        console.error('[WorkerManager] ⚠️  Shutdown timeout exceeded. Forcing exit.')
        process.exit(1)
    }, timeoutMs)

    const workerEntries = Array.from(workers.entries())
    console.log(`[WorkerManager] Closing ${workerEntries.length} worker(s)...`)

    const closurePromises = workerEntries.map(async ([name, worker]) => {
        try {
            console.log(`[WorkerManager] Closing '${name}' worker...`)
            await worker.close()
            workers.delete(name)
            console.log(`[WorkerManager] ✅ Closed '${name}' worker`)
        } catch (error) {
            console.error(
                `[WorkerManager] ❌ Error closing '${name}' worker:`,
                error?.message || error
            )
        }
    })

    // Wait for all workers to close (with Promise.allSettled to prevent early exit on error)
    const results = await Promise.allSettled(closurePromises)
    const failed = results.filter((r) => r.status === 'rejected').length

    if (failed > 0) {
        console.warn(`[WorkerManager] ⚠️  ${failed} worker(s) failed to close cleanly`)
    }

    // Clear timeout since shutdown completed
    if (shutdownTimeout) {
        clearTimeout(shutdownTimeout)
        shutdownTimeout = null
    }

    console.log('[WorkerManager] ✅ All workers closed. Safe to exit.')
}

/**
 * Setup process signal handlers for graceful shutdown
 * Should be called once during app initialization
 * @returns {void}
 */
export function setupShutdownHandlers() {
    const signals = ['SIGINT', 'SIGTERM', 'SIGHUP']

    signals.forEach((signal) => {
        process.on(signal, async () => {
            console.log(`\n[WorkerManager] Received ${signal} signal`)
            await gracefulShutdown()
            process.exit(0)
        })
    })

    console.log('[WorkerManager] Shutdown handlers installed for:', signals.join(', '))
}

/**
 * Force close a worker (use only as fallback)
 * @param {string} name - Worker name
 * @returns {Promise<void>}
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
        console.log(`[WorkerManager] ✅ Force closed '${name}' worker`)
    } catch (error) {
        console.error(`[WorkerManager] Error force closing '${name}':`, error?.message)
        workers.delete(name) // Remove anyway
    }
}

/**
 * Get worker statistics
 * @returns {Object}
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
