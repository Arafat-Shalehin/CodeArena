/**
 * Health Check Service
 * Aggregates status information from all critical systems
 * Used by health check endpoint and monitoring
 */

import mongoose from 'mongoose'
import { Redis } from 'ioredis'
import { getWorkers, getWorkerStats } from '@/lib/worker-manager.js'
import { isMongoDbReady, getDbState, getLoggingHealth } from '@/lib/safe-logger.js'
import { getErrorHandlerStatus, getErrorContext } from '@/lib/global-error-handler.js'

// Redis client instance (shared across app)
let redisClient = null

export function setRedisClient(client) {
    redisClient = client
}

/**
 * Get comprehensive health status
 * @returns {Promise<Object>} Health status object
 */
export async function getHealthStatus() {
    const timestamp = new Date().toISOString()
    const uptime = process.uptime()

    return {
        timestamp,
        uptime,
        status: 'healthy', // Default, updated after checks
        services: {
            database: await checkDatabase(),
            redis: await checkRedis(),
            workers: checkWorkers(),
            errorHandler: getErrorHandlerStatus(),
            logging: getLoggingHealth(),
            memory: getMemoryStatus(),
        },
    }
}

/**
 * Check database connectivity
 * @returns {Promise<Object>} Database status
 */
async function checkDatabase() {
    try {
        const ready = isMongoDbReady()
        const dbState = getDbState()
        const readyState = mongoose.connection.readyState

        // States: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
        const statusMap = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
        }

        const status = statusMap[readyState] || 'unknown'
        const healthy = ready && readyState === 1

        return {
            status,
            healthy,
            readyState,
            connected: healthy,
            description: dbState,
            timestamp: new Date().toISOString(),
        }
    } catch (error) {
        return {
            status: 'error',
            healthy: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        }
    }
}

/**
 * Check Redis connectivity
 * @returns {Promise<Object>} Redis status
 */
async function checkRedis() {
    try {
        if (!redisClient) {
            return {
                status: 'not-configured',
                healthy: false,
                error: 'Redis client not initialized',
                timestamp: new Date().toISOString(),
            }
        }

        // Send PING command
        const ping = await redisClient.ping()
        const healthy = ping === 'PONG'

        return {
            status: healthy ? 'connected' : 'disconnected',
            healthy,
            ping,
            timestamp: new Date().toISOString(),
        }
    } catch (error) {
        return {
            status: 'error',
            healthy: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        }
    }
}

/**
 * Check worker status
 * @returns {Object} Worker status
 */
function checkWorkers() {
    try {
        const workers = getWorkers()
        const stats = getWorkerStats()

        return {
            status: workers.size > 0 ? 'running' : 'no-workers',
            healthy: workers.size > 0,
            count: workers.size,
            names: Array.from(workers.keys()),
            stats,
            timestamp: new Date().toISOString(),
        }
    } catch (error) {
        return {
            status: 'error',
            healthy: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        }
    }
}

/**
 * Get memory usage status
 * @returns {Object} Memory status
 */
function getMemoryStatus() {
    const memUsage = process.memoryUsage()

    return {
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
        heapPercentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
        timestamp: new Date().toISOString(),
    }
}

/**
 * Get detailed health context (for debugging)
 * @returns {Promise<Object>} Detailed context
 */
export async function getDetailedHealthContext() {
    const health = await getHealthStatus()
    const errorContext = getErrorContext()

    return {
        health,
        errorContext,
        environment: {
            nodeVersion: process.version,
            nodeEnv: process.env.NODE_ENV,
            platform: process.platform,
        },
        timestamp: new Date().toISOString(),
    }
}

/**
 * Quick health check (minimal data)
 * @returns {Promise<Object>} Quick status
 */
export async function getQuickHealthStatus() {
    const dbReady = isMongoDbReady()
    const workerCount = getWorkers().size

    return {
        ok: dbReady && workerCount > 0,
        database: dbReady,
        workers: workerCount,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    }
}
