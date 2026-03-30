import { logger } from '@/lib/logger'
import { redisClient } from '@/lib/redis'

/**
 * @typedef {Object} QueryMetrics
 * @property {string} key - Metric key
 * @property {number} duration - Query duration in ms
 * @property {boolean} cached - Whether result was cached
 * @property {string} operation - Operation type (find, aggregate, etc.)
 * @property {Object} metadata - Additional metadata
 * @property {number} timestamp - Unix timestamp
 */

/**
 * Monitoring configuration
 */
export const MONITORING_CONFIG = {
    // Thresholds for performance warnings
    THRESHOLDS: {
        SLOW_QUERY: 500, // ms
        VERY_SLOW_QUERY: 1000, // ms
        SLOW_CACHE_READ: 50, // ms
    },

    // Metrics retention
    METRICS_TTL: 3600, // 1 hour
    METRICS_NAMESPACE: 'metrics:',

    // Sampling rate for metrics collection (0-1)
    SAMPLING_RATE: 1.0,

    // Enable/disable monitoring
    ENABLED: process.env.NODE_ENV !== 'test',
}

/**
 * Performance metrics collector
 * Tracks query performance and cache hits
 */
export class PerformanceMonitor {
    constructor(name) {
        this.name = name
        this.metrics = {
            totalQueries: 0,
            cachedQueries: 0,
            totalDuration: 0,
            slowQueries: 0,
            errors: 0,
            lastUpdated: new Date(),
        }
    }

    /**
     * Record a query execution
     *
     * @param {QueryMetrics} metrics - Query metrics
     */
    async recordQuery(metrics) {
        if (!MONITORING_CONFIG.ENABLED) {
            return
        }

        try {
            this.metrics.totalQueries++
            this.metrics.totalDuration += metrics.duration

            if (metrics.cached) {
                this.metrics.cachedQueries++
            }

            if (metrics.duration > MONITORING_CONFIG.THRESHOLDS.SLOW_QUERY) {
                this.metrics.slowQueries++
            }

            // Log slow queries
            if (metrics.duration > MONITORING_CONFIG.THRESHOLDS.SLOW_QUERY) {
                const severity =
                    metrics.duration > MONITORING_CONFIG.THRESHOLDS.VERY_SLOW_QUERY
                        ? 'error'
                        : 'warn'

                await logger.database[severity](`Slow query detected: ${this.name}`, {
                    operation: metrics.operation,
                    duration: metrics.duration,
                    cached: metrics.cached,
                    key: metrics.key,
                    metadata: metrics.metadata,
                })
            }

            this.metrics.lastUpdated = new Date()
        } catch (error) {
            console.error('Error recording query metric:', error.message)
        }
    }

    /**
     * Record a query error
     *
     * @param {Error} error - Error object
     * @param {Object} context - Error context
     */
    async recordError(error, context = {}) {
        if (!MONITORING_CONFIG.ENABLED) {
            return
        }

        try {
            this.metrics.errors++

            await logger.database.error(`Query error in ${this.name}`, {
                error: error.message,
                stack: error.stack,
                ...context,
            })
        } catch (err) {
            console.error('Error recording error metric:', err.message)
        }
    }

    /**
     * Get current metrics
     *
     * @returns {Object} - Current metrics snapshot
     */
    getMetrics() {
        const avgDuration =
            this.metrics.totalQueries > 0
                ? Math.round(this.metrics.totalDuration / this.metrics.totalQueries)
                : 0

        const cacheHitRate =
            this.metrics.totalQueries > 0
                ? ((this.metrics.cachedQueries / this.metrics.totalQueries) * 100).toFixed(2)
                : 0

        return {
            name: this.name,
            ...this.metrics,
            avgDuration,
            cacheHitRate: `${cacheHitRate}%`,
        }
    }

    /**
     * Reset metrics
     */
    reset() {
        this.metrics = {
            totalQueries: 0,
            cachedQueries: 0,
            totalDuration: 0,
            slowQueries: 0,
            errors: 0,
            lastUpdated: new Date(),
        }
    }
}

/**
 * Global monitoring registry
 */
const monitors = new Map()

/**
 * Get or create a monitor for a specific component
 *
 * @param {string} name - Monitor name
 * @returns {PerformanceMonitor} - Monitor instance
 */
export function getMonitor(name) {
    if (!monitors.has(name)) {
        monitors.set(name, new PerformanceMonitor(name))
    }
    return monitors.get(name)
}

/**
 * Create a monitoring wrapper for async functions
 *
 * @param {string} operationName - Name of the operation
 * @param {Function} fn - Async function to monitor
 * @returns {Function} - Wrapped function with monitoring
 */
export function withMonitoring(operationName, fn) {
    return async function (...args) {
        const startTime = performance.now()
        const monitor = getMonitor(operationName)

        try {
            const result = await fn.apply(this, args)
            const duration = Math.round(performance.now() - startTime)

            await monitor.recordQuery({
                operation: operationName,
                duration,
                cached: false,
                key: `${operationName}`,
                metadata: {},
            })

            return result
        } catch (error) {
            const duration = Math.round(performance.now() - startTime)
            await monitor.recordError(error, {
                operation: operationName,
                duration,
            })
            throw error
        }
    }
}

/**
 * Monitor database aggregation query
 *
 * @param {Object} model - Mongoose model
 * @param {Array} pipeline - Aggregation pipeline
 * @param {Object} options - Monitoring options
 * @returns {Promise<Array>} - Query results
 */
export async function monitorAggregation(model, pipeline, options = {}) {
    const { operationName = 'aggregation', userId = null, cacheKey = null } = options

    const startTime = performance.now()
    const monitor = getMonitor(operationName)

    try {
        const result = await model.aggregate(pipeline)

        const duration = Math.round(performance.now() - startTime)

        await monitor.recordQuery({
            operation: operationName,
            duration,
            cached: false,
            key: cacheKey || operationName,
            metadata: {
                userId,
                pipelineStages: pipeline.length,
            },
        })

        return result
    } catch (error) {
        const duration = Math.round(performance.now() - startTime)
        await monitor.recordError(error, {
            operation: operationName,
            duration,
            userId,
            pipelineStages: pipeline.length,
        })
        throw error
    }
}

/**
 * Monitor find query
 *
 * @param {Object} model - Mongoose model
 * @param {Object} filter - Query filter
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Query results
 */
export async function monitorFind(model, filter = {}, options = {}) {
    const {
        operationName = 'find',
        userId = null,
        cacheKey = null,
        select = null,
        skip = null,
        limit = null,
    } = options

    const startTime = performance.now()
    const monitor = getMonitor(operationName)

    try {
        let query = model.find(filter)

        if (select) {
            query = query.select(select)
        }
        if (skip !== null) {
            query = query.skip(skip)
        }
        if (limit !== null) {
            query = query.limit(limit)
        }

        const result = await query.lean().exec()

        const duration = Math.round(performance.now() - startTime)

        await monitor.recordQuery({
            operation: operationName,
            duration,
            cached: false,
            key: cacheKey || operationName,
            metadata: {
                userId,
                resultCount: result.length,
            },
        })

        return result
    } catch (error) {
        const duration = Math.round(performance.now() - startTime)
        await monitor.recordError(error, {
            operation: operationName,
            duration,
            userId,
        })
        throw error
    }
}

/**
 * Monitor findById query
 *
 * @param {Object} model - Mongoose model
 * @param {string} id - Document ID
 * @param {Object} options - Query options
 * @returns {Promise<Object|null>} - Document or null
 */
export async function monitorFindById(model, id, options = {}) {
    const { operationName = 'findById', userId = null, cacheKey = null, select = null } = options

    const startTime = performance.now()
    const monitor = getMonitor(operationName)

    try {
        let query = model.findById(id)

        if (select) {
            query = query.select(select)
        }

        const result = await query.lean().exec()

        const duration = Math.round(performance.now() - startTime)

        await monitor.recordQuery({
            operation: operationName,
            duration,
            cached: false,
            key: cacheKey || `${operationName}:${id}`,
            metadata: {
                userId,
                found: !!result,
            },
        })

        return result
    } catch (error) {
        const duration = Math.round(performance.now() - startTime)
        await monitor.recordError(error, {
            operation: operationName,
            duration,
            userId,
            documentId: id,
        })
        throw error
    }
}

/**
 * Record cache hit/miss
 *
 * @param {string} key - Cache key
 * @param {boolean} hit - Whether it was a cache hit
 * @param {number} duration - Cache access duration in ms
 */
export async function recordCacheMetric(key, hit, duration = 0) {
    if (!MONITORING_CONFIG.ENABLED) {
        return
    }

    try {
        const monitor = getMonitor('cache')

        if (hit) {
            await monitor.recordQuery({
                operation: 'cache_hit',
                duration,
                cached: true,
                key,
                metadata: {},
            })
        } else {
            await monitor.recordQuery({
                operation: 'cache_miss',
                duration,
                cached: false,
                key,
                metadata: {},
            })
        }

        // Log slow cache reads
        if (duration > MONITORING_CONFIG.THRESHOLDS.SLOW_CACHE_READ && hit) {
            await logger.system.warn('Slow cache read', {
                key,
                duration,
            })
        }
    } catch (error) {
        console.error('Error recording cache metric:', error.message)
    }
}

/**
 * Get all monitor metrics
 *
 * @returns {Array<Object>} - Array of all metrics
 */
export function getAllMetrics() {
    const metrics = []
    for (const [name, monitor] of monitors.entries()) {
        metrics.push(monitor.getMetrics())
    }
    return metrics
}

/**
 * Reset all monitors
 */
export function resetAllMetrics() {
    for (const monitor of monitors.values()) {
        monitor.reset()
    }
}

/**
 * Store metrics in Redis for persistence
 *
 * @param {string} name - Metric name
 * @param {Object} metrics - Metrics object
 */
export async function persistMetrics(name, metrics) {
    if (!redisClient.isOpen) {
        return false
    }

    try {
        const key = `${MONITORING_CONFIG.METRICS_NAMESPACE}${name}:${new Date().toISOString()}`
        await redisClient.setEx(key, MONITORING_CONFIG.METRICS_TTL, JSON.stringify(metrics))
        return true
    } catch (error) {
        console.error('Error persisting metrics:', error.message)
        return false
    }
}

/**
 * Get persisted metrics from Redis
 *
 * @param {string} name - Metric name
 * @param {number} limit - Number of metric samples to retrieve
 * @returns {Promise<Array>} - Array of persisted metrics
 */
export async function getPersistedMetrics(name, limit = 100) {
    if (!redisClient.isOpen) {
        return []
    }

    try {
        const pattern = `${MONITORING_CONFIG.METRICS_NAMESPACE}${name}:*`
        const keys = await redisClient.keys(pattern)

        if (keys.length === 0) {
            return []
        }

        const metrics = []
        const sampleKeys = keys.slice(-limit)

        for (const key of sampleKeys) {
            const value = await redisClient.get(key)
            if (value) {
                metrics.push(JSON.parse(value))
            }
        }

        return metrics
    } catch (error) {
        console.error('Error retrieving persisted metrics:', error.message)
        return []
    }
}

/**
 * Create detailed monitoring context
 * Useful for tracking entire operation flows
 */
export class MonitoringContext {
    constructor(operationId, operationName) {
        this.operationId = operationId
        this.operationName = operationName
        this.startTime = performance.now()
        this.stages = []
        this.metadata = {}
    }

    /**
     * Record a stage in the operation
     *
     * @param {string} stageName - Stage name
     * @param {number} duration - Stage duration in ms
     * @param {Object} metadata - Stage metadata
     */
    recordStage(stageName, duration, metadata = {}) {
        this.stages.push({
            name: stageName,
            duration,
            metadata,
        })
    }

    /**
     * Add metadata to the context
     *
     * @param {string} key - Metadata key
     * @param {*} value - Metadata value
     */
    setMetadata(key, value) {
        this.metadata[key] = value
    }

    /**
     * Get total duration
     *
     * @returns {number} - Total duration in ms
     */
    getTotalDuration() {
        return Math.round(performance.now() - this.startTime)
    }

    /**
     * Get summary
     *
     * @returns {Object} - Operation summary
     */
    getSummary() {
        const totalDuration = this.getTotalDuration()

        return {
            operationId: this.operationId,
            operationName: this.operationName,
            totalDuration,
            stageCount: this.stages.length,
            stages: this.stages,
            metadata: this.metadata,
            timestamp: new Date().toISOString(),
        }
    }

    /**
     * Log the operation summary
     */
    async logSummary() {
        const summary = this.getSummary()

        const severity =
            summary.totalDuration > MONITORING_CONFIG.THRESHOLDS.VERY_SLOW_QUERY
                ? 'error'
                : summary.totalDuration > MONITORING_CONFIG.THRESHOLDS.SLOW_QUERY
                  ? 'warn'
                  : 'info'

        await logger.system[severity](`Operation completed: ${this.operationName}`, summary)
    }
}

export default {
    PerformanceMonitor,
    getMonitor,
    withMonitoring,
    monitorAggregation,
    monitorFind,
    monitorFindById,
    recordCacheMetric,
    getAllMetrics,
    resetAllMetrics,
    persistMetrics,
    getPersistedMetrics,
    MonitoringContext,
    MONITORING_CONFIG,
}
