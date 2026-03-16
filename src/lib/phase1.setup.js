/**
 * Phase 1 Setup and Integration Examples
 * Demonstrates how to use all Phase 1 modules together
 *
 * This file provides practical examples and integration patterns
 * for database indexes, caching, monitoring, and cache warming.
 */

import dbConnect from '@/lib/mongodb'
import { setupDatabaseIndexes } from '@/lib/setupIndexes'
import { performCacheWarming } from '@/services/cacheWarming.service'
import { getMonitor, getAllMetrics } from '@/lib/monitoring'
import { logger } from '@/lib/logger'

/**
 * Initialize all Phase 1 components
 * Call this during application startup
 *
 * @async
 * @returns {Promise<Object>} - Initialization results
 */
export async function initializePhase1() {
    const results = {
        timestamp: new Date().toISOString(),
        components: {},
        success: false,
        totalDuration: 0,
        errors: [],
    }

    const startTime = Date.now()

    try {
        await logger.system.info('Phase 1 initialization started')

        // Step 1: Connect to database
        await logger.system.info('Connecting to MongoDB...')
        await dbConnect()
        await logger.system.info('MongoDB connected successfully')

        // Step 2: Setup indexes
        await logger.system.info('Setting up database indexes...')
        const indexResults = await setupDatabaseIndexes()
        results.components.indexes = indexResults
        if (!indexResults.success) {
            results.errors.push(...indexResults.errors)
        }

        // Step 3: Warm cache
        await logger.system.info('Warming cache...')
        const warmingResults = await performCacheWarming({
            warmLists: true,
            warmTags: true,
            warmDetails: true,
            timeout: 30000,
        })
        results.components.cacheWarming = warmingResults
        if (!warmingResults.success) {
            results.errors.push(...warmingResults.errors)
        }

        results.success = results.errors.length === 0
        results.totalDuration = Date.now() - startTime

        await logger.system.info('Phase 1 initialization completed', {
            success: results.success,
            duration: `${results.totalDuration}ms`,
            errors: results.errors.length,
        })

        return results
    } catch (error) {
        results.totalDuration = Date.now() - startTime
        results.errors.push(error.message)
        results.success = false

        await logger.system.error('Phase 1 initialization failed', {
            error: error.message,
            duration: `${results.totalDuration}ms`,
        })

        return results
    }
}

/**
 * Example: Using cache with database queries
 *
 * Pattern for implementing cache-aware database service
 */
export const cacheAwareQueryExample = {
    /**
     * Get problems with caching
     */
    async getProblems(query) {
        const { problemCacheService } = await import('@/services/cache.service')
        const { monitorFind } = await import('@/lib/monitoring')
        const { Problem } = await import('@/models/Problem.models')

        // Generate cache key from query parameters
        const cacheKey = problemCacheService.generateListKey(query)

        // Try to get from cache
        const cached = await problemCacheService.getList(cacheKey)
        if (cached) {
            // Record cache hit
            const { recordCacheMetric } = await import('@/lib/monitoring')
            await recordCacheMetric(cacheKey, true, 2)
            return cached
        }

        // Build database filter
        const filter = {}
        if (query.difficulty && query.difficulty !== 'all') {
            filter.difficulty = query.difficulty
        }
        if (query.tags) {
            filter.tags = { $in: Array.isArray(query.tags) ? query.tags : [query.tags] }
        }

        // Fetch from database with monitoring
        const problems = await monitorFind(Problem, filter, {
            operationName: 'fetch-problems',
            select: '-sampleTestCases -specialJudgeCode',
            skip: (query.page - 1) * query.limit,
            limit: query.limit,
        })

        // Cache the result
        const cacheData = {
            data: problems,
            pagination: {
                page: query.page,
                limit: query.limit,
                total: await Problem.countDocuments(filter),
            },
        }
        await problemCacheService.setList(cacheKey, cacheData)

        return cacheData
    },

    /**
     * Get problem detail with caching
     */
    async getProblemDetail(problemId) {
        const { problemCacheService } = await import('@/services/cache.service')
        const { monitorFindById } = await import('@/lib/monitoring')
        const { Problem } = await import('@/models/Problem.models')

        // Try cache first
        const cached = await problemCacheService.getDetail(problemId)
        if (cached) {
            const { recordCacheMetric } = await import('@/lib/monitoring')
            await recordCacheMetric(problemCacheService.generateDetailKey(problemId), true, 1)
            return cached
        }

        // Fetch from database
        const problem = await monitorFindById(Problem, problemId, {
            operationName: 'fetch-problem-detail',
        })

        if (problem) {
            await problemCacheService.setDetail(problemId, problem)
        }

        return problem
    },

    /**
     * Invalidate caches after problem update
     */
    async invalidateAfterUpdate(problemId) {
        const { problemCacheService } = await import('@/services/cache.service')
        await problemCacheService.invalidateProblem(problemId)
        await logger.system.info('Problem cache invalidated', { problemId })
    },
}

/**
 * Example: Monitoring and metrics collection
 */
export const monitoringExample = {
    /**
     * Get performance metrics for the application
     */
    async getPerformanceMetrics() {
        const { getAllMetrics } = await import('@/lib/monitoring')

        const metrics = getAllMetrics()

        return {
            timestamp: new Date().toISOString(),
            monitors: metrics,
            summary: {
                totalQueries: metrics.reduce((sum, m) => sum + m.totalQueries, 0),
                totalDuration: metrics.reduce((sum, m) => sum + m.totalDuration, 0),
                averageCacheHitRate: (
                    metrics.reduce((sum, m) => {
                        const rate = parseFloat(m.cacheHitRate)
                        return sum + (isNaN(rate) ? 0 : rate)
                    }, 0) / Math.max(metrics.length, 1)
                ).toFixed(2),
            },
        }
    },

    /**
     * Track a multi-stage operation
     */
    async trackComplexOperation(operationName, operationFn) {
        const { MonitoringContext } = await import('@/lib/monitoring')

        const context = new MonitoringContext(`op-${Date.now()}`, operationName)

        try {
            const result = await operationFn(context)
            await context.logSummary()
            return result
        } catch (error) {
            await logger.system.error(`Operation failed: ${operationName}`, {
                error: error.message,
            })
            throw error
        }
    },

    /**
     * Example: Track problem search operation
     */
    async trackSearchOperation(searchQuery) {
        const { MonitoringContext } = await import('@/lib/monitoring')
        const { Problem } = await import('@/models/Problem.models')

        const context = new MonitoringContext(`search-${Date.now()}`, 'problem-search')

        // Stage 1: Parse and validate search
        let stage1 = performance.now()
        const filter = { $text: { $search: searchQuery } }
        context.recordStage('parse-search', performance.now() - stage1)

        // Stage 2: Execute search query
        let stage2 = performance.now()
        const results = await Problem.find(filter)
            .select('title difficulty tags acceptanceRate')
            .limit(20)
            .lean()
        context.recordStage('database-search', performance.now() - stage2)

        // Stage 3: Cache results
        let stage3 = performance.now()
        const { cacheStats } = await import('@/services/cache.service')
        const keyCount = await cacheStats.getKeyCount()
        context.recordStage('cache-check', performance.now() - stage3)

        // Add metadata
        context.setMetadata('searchQuery', searchQuery)
        context.setMetadata('resultCount', results.length)
        context.setMetadata('cacheSize', keyCount)

        await context.logSummary()
        return results
    },
}

/**
 * Example: Cache invalidation strategy
 */
export const cacheInvalidationExample = {
    /**
     * On problem creation
     */
    async handleProblemCreated(problemId) {
        const { problemCacheService } = await import('@/services/cache.service')

        // Invalidate list caches (user might want to see new problem)
        await problemCacheService.invalidateAll()

        await logger.system.info('Cache invalidated after problem creation', {
            problemId,
        })
    },

    /**
     * On user submission (problem solved)
     */
    async handleSubmissionSuccess(userId, problemId) {
        const { problemCacheService, userCacheService, recommendationCacheService } =
            await import('@/services/cache.service')

        // Invalidate user-specific caches
        await Promise.all([
            userCacheService.invalidateAll(userId),
            recommendationCacheService.invalidateAll(userId),
            // Also invalidate problem stats (acceptance rate changed)
            problemCacheService.invalidateProblem(problemId),
        ])

        await logger.system.info('Cache invalidated after successful submission', {
            userId,
            problemId,
        })
    },

    /**
     * On problem metadata update
     */
    async handleProblemUpdated(problemId, updateData) {
        const { problemCacheService } = await import('@/services/cache.service')

        // Invalidate all problem caches
        await problemCacheService.invalidateAll()

        await logger.system.info('All problem caches invalidated', {
            problemId,
            updatedFields: Object.keys(updateData),
        })
    },
}

/**
 * Example: Health check and status reporting
 */
export const healthCheckExample = {
    /**
     * Get Phase 1 component health status
     */
    async getPhase1Status() {
        const { getWarmingStatus } = await import('@/services/cacheWarming.service')
        const { cacheStats } = await import('@/services/cache.service')
        const { getIndexStatistics } = await import('@/lib/setupIndexes')
        const { redisClient } = await import('@/lib/redis')

        const warmingStatus = await getWarmingStatus()
        const cacheInfo = await cacheStats.getInfo()
        const indexStats = await getIndexStatistics()

        return {
            timestamp: new Date().toISOString(),
            redis: {
                connected: redisClient && redisClient.isOpen,
                info: cacheInfo ? cacheInfo.split('\r\n')[0] : 'unavailable',
            },
            cache: {
                enabled: warmingStatus.redisAvailable,
                health: warmingStatus.cacheHealth,
            },
            indexes: {
                collections: Object.keys(indexStats.collections || {}),
            },
            status: 'healthy',
        }
    },

    /**
     * Detailed system diagnostics
     */
    async runDiagnostics() {
        const status = await this.getPhase1Status()
        const metrics = await monitoringExample.getPerformanceMetrics()

        return {
            timestamp: new Date().toISOString(),
            status,
            performance: metrics.summary,
            diagnostics: {
                redisReady: status.redis.connected,
                cacheWarm: status.cache.health.listsCount > 0,
                indexesReady: status.indexes.collections.length > 0,
                metrics: {
                    totalQueries: metrics.summary.totalQueries,
                    avgCacheHitRate: `${metrics.summary.averageCacheHitRate}%`,
                },
            },
        }
    },
}

/**
 * Example: Development utilities
 */
export const developmentUtils = {
    /**
     * Reset all caches and indexes (use with caution!)
     */
    async resetEverything() {
        const { clearWarmedCaches } = await import('@/services/cacheWarming.service')
        const { cacheStats } = await import('@/services/cache.service')

        if (process.env.NODE_ENV !== 'development') {
            throw new Error('Reset is only allowed in development mode')
        }

        await logger.system.warn('Resetting all Phase 1 caches and data')

        // Clear caches
        await clearWarmedCaches()
        await cacheStats.flushAll()

        // Rebuild indexes
        const { rebuildIndexes } = await import('@/lib/setupIndexes')
        await rebuildIndexes('Problem')
        await rebuildIndexes('Submission')

        await logger.system.info('Phase 1 reset completed')
    },

    /**
     * Simulate slow query for testing
     */
    async simulateSlowQuery(durationMs = 1000) {
        const { getMonitor } = await import('@/lib/monitoring')

        const monitor = getMonitor('simulated-slow-query')

        await monitor.recordQuery({
            operation: 'test-slow-query',
            duration: durationMs,
            cached: false,
            key: 'test:slow',
            metadata: { simulation: true },
        })

        return {
            message: `Slow query simulated (${durationMs}ms)`,
            metrics: monitor.getMetrics(),
        }
    },

    /**
     * View all current metrics
     */
    async viewAllMetrics() {
        const { getAllMetrics } = await import('@/lib/monitoring')

        const metrics = getAllMetrics()

        console.table(
            metrics.map((m) => ({
                Operation: m.name,
                'Total Queries': m.totalQueries,
                'Avg Duration (ms)': m.avgDuration,
                'Cache Hit Rate': m.cacheHitRate,
                'Slow Queries': m.slowQueries,
                Errors: m.errors,
            }))
        )

        return metrics
    },

    /**
     * Check cache key patterns
     */
    async inspectCacheKeys(pattern = '*') {
        const { redisClient } = await import('@/lib/redis')

        if (!redisClient.isOpen) {
            return { error: 'Redis not available' }
        }

        const keys = await redisClient.keys(pattern)

        return {
            pattern,
            count: keys.length,
            keys: keys.slice(0, 50), // Show first 50
            truncated: keys.length > 50,
        }
    },
}

/**
 * Example: Middleware for automatic cache management
 */
export function createCacheMiddleware() {
    return async (req, res, next) => {
        // Add cache utilities to request
        const { problemCacheService, userCacheService } = await import('@/services/cache.service')
        const { recordCacheMetric } = await import('@/lib/monitoring')

        req.cache = {
            problem: problemCacheService,
            user: userCacheService,
            recordMetric: recordCacheMetric,
        }

        next()
    }
}

/**
 * Example: API route handler with full Phase 1 integration
 */
export async function handleProblemsAPIWithPhase1(req, res) {
    const { cacheAwareQueryExample, monitoringExample } = await import('@/lib/phase1.setup')

    try {
        // Parse query parameters
        const { page = 1, limit = 20, difficulty = 'all', sortBy = 'createdAt' } = req.query

        // Track the entire operation
        const result = await monitoringExample.trackComplexOperation(
            'api-get-problems',
            async (context) => {
                // Fetch problems with caching
                let stage1 = performance.now()
                const problems = await cacheAwareQueryExample.getProblems({
                    page: parseInt(page),
                    limit: parseInt(limit),
                    difficulty,
                    sortBy,
                })
                context.recordStage('fetch-problems', performance.now() - stage1)

                // Process response
                let stage2 = performance.now()
                const response = {
                    success: true,
                    data: problems.data,
                    pagination: problems.pagination,
                }
                context.recordStage('format-response', performance.now() - stage2)

                context.setMetadata('resultCount', problems.data.length)
                context.setMetadata('cacheStatus', 'hit-or-miss')

                return response
            }
        )

        return result
    } catch (error) {
        await logger.system.error('Problems API error', {
            error: error.message,
            query: req.query,
        })

        return {
            success: false,
            error: error.message,
        }
    }
}

/**
 * Export all examples and utilities
 */
export default {
    initializePhase1,
    cacheAwareQueryExample,
    monitoringExample,
    cacheInvalidationExample,
    healthCheckExample,
    developmentUtils,
    createCacheMiddleware,
    handleProblemsAPIWithPhase1,
}
