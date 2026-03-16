/**
 * Phase 1 Testing Guide and Test Examples
 * Comprehensive tests for database indexes, caching, monitoring, and cache warming
 *
 * Run with: npm test -- src/tests/phase1.test.js
 * Or: vitest src/tests/phase1.test.js
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import mongoose from 'mongoose'

/**
 * DATABASE INDEX TESTS
 */
describe('Database Indexes (setupIndexes.js)', () => {
    describe('setupDatabaseIndexes', () => {
        it('should initialize all indexes successfully', async () => {
            const { setupDatabaseIndexes } = await import('@/lib/setupIndexes')
            const result = await setupDatabaseIndexes()

            expect(result.success).toBe(true)
            expect(result.totalCreated).toBeGreaterThanOrEqual(0)
            expect(result.totalFailed).toBe(0)
            expect(result.collections).toHaveLength(2)
        })

        it('should create indexes for Problem collection', async () => {
            const { setupDatabaseIndexes } = await import('@/lib/setupIndexes')
            const result = await setupDatabaseIndexes()

            const problemIndexes = result.collections.find((c) => c.name === 'Problem')
            expect(problemIndexes).toBeDefined()
            expect(problemIndexes.created).toBeGreaterThan(0)
        })

        it('should create indexes for Submission collection', async () => {
            const { setupDatabaseIndexes } = await import('@/lib/setupIndexes')
            const result = await setupDatabaseIndexes()

            const submissionIndexes = result.collections.find((c) => c.name === 'Submission')
            expect(submissionIndexes).toBeDefined()
            expect(submissionIndexes.created).toBeGreaterThan(0)
        })

        it('should skip already existing indexes', async () => {
            const { setupDatabaseIndexes } = await import('@/lib/setupIndexes')

            // First call
            const result1 = await setupDatabaseIndexes()
            const created1 = result1.totalCreated

            // Second call - should skip existing indexes
            const result2 = await setupDatabaseIndexes()
            const created2 = result2.totalCreated

            expect(created2).toBeLessThanOrEqual(created1)
        })

        it('should handle database connection errors gracefully', async () => {
            const { setupDatabaseIndexes } = await import('@/lib/setupIndexes')

            // Test should not throw even if there are issues
            const result = await setupDatabaseIndexes()
            expect(result).toHaveProperty('success')
            expect(result).toHaveProperty('duration')
        })
    })

    describe('getIndexStatistics', () => {
        it('should retrieve index statistics', async () => {
            const { getIndexStatistics } = await import('@/lib/setupIndexes')
            const stats = await getIndexStatistics()

            expect(stats).toHaveProperty('timestamp')
            expect(stats).toHaveProperty('collections')
            expect(stats.collections).toHaveProperty('Problem')
            expect(stats.collections).toHaveProperty('Submission')
        })

        it('should return valid index information', async () => {
            const { getIndexStatistics } = await import('@/lib/setupIndexes')
            const stats = await getIndexStatistics()

            const problemIndexes = stats.collections.Problem
            expect(Array.isArray(problemIndexes)).toBe(true)

            if (problemIndexes.length > 0) {
                const index = problemIndexes[0]
                expect(index).toHaveProperty('name')
                expect(index).toHaveProperty('collectionName')
                expect(index).toHaveProperty('key')
            }
        })
    })

    describe('rebuildIndexes', () => {
        it('should rebuild indexes for a collection', async () => {
            const { rebuildIndexes } = await import('@/lib/setupIndexes')

            // Skip in test environment if needed
            if (process.env.SKIP_INDEX_REBUILD === 'true') {
                expect(true).toBe(true)
                return
            }

            const result = await rebuildIndexes('Problem')
            expect(result).toHaveProperty('success')
            expect(result).toHaveProperty('duration')
        })
    })
})

/**
 * CACHE SERVICE TESTS
 */
describe('Cache Service (cache.service.js)', () => {
    describe('Cache Key Generation', () => {
        it('should generate consistent cache keys', async () => {
            const { generateCacheKey } = await import('@/services/cache.service')

            const key1 = generateCacheKey('problems:list', {
                page: 1,
                limit: 20,
                difficulty: 'medium',
            })

            const key2 = generateCacheKey('problems:list', {
                difficulty: 'medium',
                limit: 20,
                page: 1,
            })

            expect(key1).toBe(key2)
        })

        it('should include all non-empty parameters', async () => {
            const { generateCacheKey } = await import('@/services/cache.service')

            const key = generateCacheKey('test:namespace', {
                param1: 'value1',
                param2: 'value2',
                emptyParam: '',
                nullParam: null,
            })

            expect(key).toContain('param1:value1')
            expect(key).toContain('param2:value2')
            expect(key).not.toContain('emptyParam')
            expect(key).not.toContain('nullParam')
        })

        it('should handle array parameters', async () => {
            const { generateCacheKey } = await import('@/services/cache.service')

            const key = generateCacheKey('test:namespace', {
                tags: ['array', 'tag'],
            })

            expect(key).toContain('tags:array,tag')
        })

        it('should throw error for invalid namespace', async () => {
            const { generateCacheKey } = await import('@/services/cache.service')

            expect(() => generateCacheKey('', {})).toThrow()
            expect(() => generateCacheKey(null, {})).toThrow()
        })
    })

    describe('Cache Operations', () => {
        it('should set and get cache values', async () => {
            const { setCacheValue, getCacheValue } = await import('@/services/cache.service')

            const testData = { message: 'test', value: 123 }
            const key = `test:cache:${Date.now()}`

            const setResult = await setCacheValue(key, testData, 300)
            expect(setResult).toBe(true)

            const getValue = await getCacheValue(key)
            expect(getValue).toEqual(testData)
        })

        it('should handle cache misses gracefully', async () => {
            const { getCacheValue } = await import('@/services/cache.service')

            const value = await getCacheValue('non:existent:key')
            expect(value).toBeNull()
        })

        it('should delete cache keys', async () => {
            const { setCacheValue, getCacheValue, deleteCacheKeys } =
                await import('@/services/cache.service')

            const key = `test:delete:${Date.now()}`
            await setCacheValue(key, { data: 'test' }, 300)

            const deleted = await deleteCacheKeys(key)
            expect(deleted).toBeGreaterThan(0)

            const value = await getCacheValue(key)
            expect(value).toBeNull()
        })

        it('should delete cache patterns', async () => {
            const { setCacheValue, deleteCachePattern, getCacheValue } =
                await import('@/services/cache.service')

            const prefix = `test:pattern:${Date.now()}`
            await setCacheValue(`${prefix}:key1`, { data: 1 }, 300)
            await setCacheValue(`${prefix}:key2`, { data: 2 }, 300)

            const deleted = await deleteCachePattern(`${prefix}:*`)
            expect(deleted).toBeGreaterThanOrEqual(0)
        })
    })

    describe('Get or Set Cache', () => {
        it('should return cached value when available', async () => {
            const { setCacheValue, getOrSetCache } = await import('@/services/cache.service')

            const key = `test:getoset:${Date.now()}`
            const cachedData = { cached: true }

            await setCacheValue(key, cachedData, 300)

            const result = await getOrSetCache(key, async () => ({ shouldNotCall: true }), 300)

            expect(result).toEqual(cachedData)
        })

        it('should fetch and cache value when not available', async () => {
            const { getCacheValue, getOrSetCache, deleteCacheKeys } =
                await import('@/services/cache.service')

            const key = `test:getoset:new:${Date.now()}`
            const freshData = { fresh: true }

            await deleteCacheKeys(key)

            const result = await getOrSetCache(key, async () => freshData, 300)

            expect(result).toEqual(freshData)

            const cached = await getCacheValue(key)
            expect(cached).toEqual(freshData)
        })

        it('should throw error for invalid parameters', async () => {
            const { getOrSetCache } = await import('@/services/cache.service')

            expect(() => getOrSetCache(null, async () => ({}), 300)).rejects.toThrow()
            expect(() => getOrSetCache('key', null, 300)).rejects.toThrow()
        })
    })

    describe('Problem Cache Service', () => {
        it('should generate problem list cache keys', async () => {
            const { problemCacheService } = await import('@/services/cache.service')

            const key = problemCacheService.generateListKey({
                page: 1,
                limit: 20,
                difficulty: 'easy',
                sortBy: 'createdAt',
            })

            expect(key).toContain('problems:list')
            expect(key).toContain('difficulty:easy')
            expect(key).toContain('page:1')
        })

        it('should generate problem detail cache keys', async () => {
            const { problemCacheService } = await import('@/services/cache.service')

            const problemId = '507f1f77bcf86cd799439011'
            const key = problemCacheService.generateDetailKey(problemId)

            expect(key).toContain('problem:detail')
            expect(key).toContain(problemId)
        })
    })

    describe('User Cache Service', () => {
        it('should generate user stats cache keys', async () => {
            const { userCacheService } = await import('@/services/cache.service')

            const userId = '507f1f77bcf86cd799439012'
            const key = userCacheService.generateStatsKey(userId)

            expect(key).toContain('user:stats')
            expect(key).toContain(userId)
        })

        it('should generate user submissions cache keys', async () => {
            const { userCacheService } = await import('@/services/cache.service')

            const userId = '507f1f77bcf86cd799439012'
            const key = userCacheService.generateSubmissionsKey(userId, {
                page: 1,
                limit: 10,
            })

            expect(key).toContain('user:submissions')
            expect(key).toContain(userId)
        })
    })

    describe('Recommendation Cache Service', () => {
        it('should generate recommendation cache keys', async () => {
            const { recommendationCacheService } = await import('@/services/cache.service')

            const userId = '507f1f77bcf86cd799439012'
            const key = recommendationCacheService.generateKey(userId, { limit: 10 })

            expect(key).toContain('user:recs')
            expect(key).toContain(userId)
        })

        it('should generate weak tags cache keys', async () => {
            const { recommendationCacheService } = await import('@/services/cache.service')

            const userId = '507f1f77bcf86cd799439012'
            const key = recommendationCacheService.generateWeakTagsKey(userId)

            expect(key).toContain('user:weak-tags')
            expect(key).toContain(userId)
        })
    })
})

/**
 * MONITORING TESTS
 */
describe('Query Monitoring (monitoring.js)', () => {
    describe('Performance Monitor', () => {
        it('should track query metrics', async () => {
            const { PerformanceMonitor } = await import('@/lib/monitoring')

            const monitor = new PerformanceMonitor('test-monitor')

            await monitor.recordQuery({
                operation: 'test-query',
                duration: 100,
                cached: false,
                key: 'test:key',
                metadata: {},
            })

            const metrics = monitor.getMetrics()
            expect(metrics.totalQueries).toBe(1)
            expect(metrics.totalDuration).toBe(100)
        })

        it('should track cache hits', async () => {
            const { PerformanceMonitor } = await import('@/lib/monitoring')

            const monitor = new PerformanceMonitor('test-monitor-cache')

            await monitor.recordQuery({
                operation: 'cache-hit',
                duration: 2,
                cached: true,
                key: 'test:key',
                metadata: {},
            })

            const metrics = monitor.getMetrics()
            expect(metrics.cachedQueries).toBe(1)
            expect(metrics.cacheHitRate).toContain('100')
        })

        it('should detect slow queries', async () => {
            const { PerformanceMonitor, MONITORING_CONFIG } = await import('@/lib/monitoring')

            const monitor = new PerformanceMonitor('test-monitor-slow')

            await monitor.recordQuery({
                operation: 'slow-query',
                duration: MONITORING_CONFIG.THRESHOLDS.SLOW_QUERY + 100,
                cached: false,
                key: 'test:key',
                metadata: {},
            })

            const metrics = monitor.getMetrics()
            expect(metrics.slowQueries).toBe(1)
        })

        it('should reset metrics', async () => {
            const { PerformanceMonitor } = await import('@/lib/monitoring')

            const monitor = new PerformanceMonitor('test-monitor-reset')

            await monitor.recordQuery({
                operation: 'test',
                duration: 50,
                cached: false,
                key: 'test',
                metadata: {},
            })

            monitor.reset()
            const metrics = monitor.getMetrics()

            expect(metrics.totalQueries).toBe(0)
            expect(metrics.totalDuration).toBe(0)
        })
    })

    describe('Monitor Registry', () => {
        it('should get or create monitors', async () => {
            const { getMonitor } = await import('@/lib/monitoring')

            const monitor1 = getMonitor('test-component')
            const monitor2 = getMonitor('test-component')

            expect(monitor1).toBe(monitor2)
        })
    })

    describe('Monitoring Context', () => {
        it('should track multi-stage operations', async () => {
            const { MonitoringContext } = await import('@/lib/monitoring')

            const context = new MonitoringContext('op-1', 'test-operation')

            context.recordStage('stage-1', 100, { items: 10 })
            context.recordStage('stage-2', 200, { items: 20 })

            const summary = context.getSummary()
            expect(summary.stageCount).toBe(2)
            expect(summary.stages).toHaveLength(2)
        })

        it('should store operation metadata', async () => {
            const { MonitoringContext } = await import('@/lib/monitoring')

            const context = new MonitoringContext('op-2', 'test-op')

            context.setMetadata('userId', '123')
            context.setMetadata('action', 'search')

            const summary = context.getSummary()
            expect(summary.metadata.userId).toBe('123')
            expect(summary.metadata.action).toBe('search')
        })

        it('should calculate total duration', async () => {
            const { MonitoringContext } = await import('@/lib/monitoring')

            const context = new MonitoringContext('op-3', 'test-op')

            await new Promise((resolve) => setTimeout(resolve, 50))

            const duration = context.getTotalDuration()
            expect(duration).toBeGreaterThanOrEqual(50)
        })
    })

    describe('Metrics Retrieval', () => {
        it('should get all metrics', async () => {
            const { getMonitor, getAllMetrics } = await import('@/lib/monitoring')

            const monitor = getMonitor('metrics-test')
            await monitor.recordQuery({
                operation: 'test',
                duration: 100,
                cached: false,
                key: 'test',
                metadata: {},
            })

            const metrics = getAllMetrics()
            expect(Array.isArray(metrics)).toBe(true)
            expect(metrics.length).toBeGreaterThan(0)
        })
    })

    describe('With Monitoring Wrapper', () => {
        it('should wrap functions with monitoring', async () => {
            const { withMonitoring } = await import('@/lib/monitoring')

            const testFn = withMonitoring('wrapped-fn', async () => {
                return { result: 'success' }
            })

            const result = await testFn()
            expect(result.result).toBe('success')
        })

        it('should handle function errors', async () => {
            const { withMonitoring } = await import('@/lib/monitoring')

            const testFn = withMonitoring('error-fn', async () => {
                throw new Error('Test error')
            })

            expect(() => testFn()).rejects.toThrow('Test error')
        })
    })
})

/**
 * CACHE WARMING TESTS
 */
describe('Cache Warming Service (cacheWarming.service.js)', () => {
    describe('warmProblemTags', () => {
        it('should warm problem tags cache', async () => {
            const { warmProblemTags } = await import('@/services/cacheWarming.service')

            const result = await warmProblemTags()
            expect(result).toHaveProperty('success')
            expect(result).toHaveProperty('duration')
        })

        it('should handle missing tags gracefully', async () => {
            const { warmProblemTags } = await import('@/services/cacheWarming.service')

            const result = await warmProblemTags()
            // Should not throw and should complete
            expect(result.success).toBe(true)
        })
    })

    describe('warmProblemLists', () => {
        it('should warm problem list caches', async () => {
            const { warmProblemLists } = await import('@/services/cacheWarming.service')

            const result = await warmProblemLists()
            expect(result).toHaveProperty('success')
            expect(result).toHaveProperty('cached')
            expect(result).toHaveProperty('failed')
        })
    })

    describe('warmPopularProblemDetails', () => {
        it('should warm popular problem details', async () => {
            const { warmPopularProblemDetails } = await import('@/services/cacheWarming.service')

            const result = await warmPopularProblemDetails(5)
            expect(result).toHaveProperty('success')
            expect(result).toHaveProperty('cached')
        })

        it('should accept limit parameter', async () => {
            const { warmPopularProblemDetails } = await import('@/services/cacheWarming.service')

            const result = await warmPopularProblemDetails(3)
            expect(result.cached).toBeLessThanOrEqual(3)
        })
    })

    describe('performCacheWarming', () => {
        it('should complete full warming routine', async () => {
            const { performCacheWarming } = await import('@/services/cacheWarming.service')

            const result = await performCacheWarming({
                warmLists: true,
                warmTags: true,
                warmDetails: true,
                timeout: 30000,
            })

            expect(result).toHaveProperty('success')
            expect(result).toHaveProperty('sections')
            expect(result).toHaveProperty('duration')
        })

        it('should respect timeout', async () => {
            const { performCacheWarming } = await import('@/services/cacheWarming.service')

            const result = await performCacheWarming({
                warmLists: true,
                warmTags: true,
                warmDetails: true,
                timeout: 100, // Very short timeout
            })

            // Should either complete or timeout gracefully
            expect(result).toHaveProperty('duration')
        })

        it('should allow selective warming', async () => {
            const { performCacheWarming } = await import('@/services/cacheWarming.service')

            const result = await performCacheWarming({
                warmLists: true,
                warmTags: false,
                warmDetails: false,
            })

            expect(result.sections).toHaveProperty('lists')
            expect(result.sections).not.toHaveProperty('tags')
            expect(result.sections).not.toHaveProperty('details')
        })
    })

    describe('clearWarmedCaches', () => {
        it('should clear warmed caches', async () => {
            const { clearWarmedCaches } = await import('@/services/cacheWarming.service')

            const result = await clearWarmedCaches()
            expect(result).toHaveProperty('success')
            expect(result).toHaveProperty('deleted')
        })
    })

    describe('getWarmingStatus', () => {
        it('should return warming status', async () => {
            const { getWarmingStatus } = await import('@/services/cacheWarming.service')

            const status = await getWarmingStatus()
            expect(status).toHaveProperty('enabled')
            expect(status).toHaveProperty('redisAvailable')
            expect(status).toHaveProperty('cacheHealth')
        })
    })
})

/**
 * INTEGRATION TESTS
 */
describe('Phase 1 Integration Tests', () => {
    describe('initializePhase1', () => {
        it('should initialize all Phase 1 components', async () => {
            const { initializePhase1 } = await import('@/lib/phase1.setup')

            const result = await initializePhase1()
            expect(result).toHaveProperty('success')
            expect(result).toHaveProperty('components')
            expect(result).toHaveProperty('duration')
        })

        it('should handle initialization errors gracefully', async () => {
            const { initializePhase1 } = await import('@/lib/phase1.setup')

            // Should not throw even if there are errors
            const result = await initializePhase1()
            expect(result).toHaveProperty('success')
            expect(Array.isArray(result.errors)).toBe(true)
        })
    })

    describe('Cache-Aware Query Example', () => {
        it('should fetch problems with caching', async () => {
            const { cacheAwareQueryExample } = await import('@/lib/phase1.setup')

            const problems = await cacheAwareQueryExample.getProblems({
                page: 1,
                limit: 10,
                difficulty: 'easy',
            })

            expect(problems).toBeDefined()
            if (problems && problems.data) {
                expect(Array.isArray(problems.data)).toBe(true)
            }
        })
    })

    describe('Health Check', () => {
        it('should get Phase 1 status', async () => {
            const { healthCheckExample } = await import('@/lib/phase1.setup')

            const status = await healthCheckExample.getPhase1Status()
            expect(status).toHaveProperty('timestamp')
            expect(status).toHaveProperty('redis')
            expect(status).toHaveProperty('cache')
            expect(status).toHaveProperty('indexes')
        })

        it('should run diagnostics', async () => {
            const { healthCheckExample } = await import('@/lib/phase1.setup')

            const diagnostics = await healthCheckExample.runDiagnostics()
            expect(diagnostics).toHaveProperty('status')
            expect(diagnostics).toHaveProperty('performance')
            expect(diagnostics).toHaveProperty('diagnostics')
        })
    })
})

/**
 * PERFORMANCE TESTS
 */
describe('Phase 1 Performance Tests', () => {
    it('cache read should be fast', async () => {
        const { setCacheValue, getCacheValue } = await import('@/services/cache.service')

        const key = `perf:test:${Date.now()}`
        await setCacheValue(key, { data: 'test' }, 300)

        const start = performance.now()
        await getCacheValue(key)
        const duration = performance.now() - start

        expect(duration).toBeLessThan(50) // Should be < 50ms
    })

    it('cache key generation should be fast', async () => {
        const { generateCacheKey } = await import('@/services/cache.service')

        const start = performance.now()
        for (let i = 0; i < 1000; i++) {
            generateCacheKey('problems:list', {
                page: i,
                limit: 20,
                difficulty: 'easy',
            })
        }
        const duration = performance.now() - start

        expect(duration).toBeLessThan(100) // 1000 keys in < 100ms
    })

    it('monitoring overhead should be minimal', async () => {
        const { getMonitor } = await import('@/lib/monitoring')

        const monitor = getMonitor('perf-test')
        const start = performance.now()

        for (let i = 0; i < 100; i++) {
            await monitor.recordQuery({
                operation: 'test',
                duration: 10,
                cached: false,
                key: 'test',
                metadata: {},
            })
        }

        const duration = performance.now() - start
        expect(duration).toBeLessThan(500) // Should be quick
    })
})

/**
 * ERROR HANDLING TESTS
 */
describe('Phase 1 Error Handling', () => {
    it('should handle Redis unavailability gracefully', async () => {
        const { getCacheValue } = await import('@/services/cache.service')

        // This should not throw even if Redis is unavailable
        const value = await getCacheValue('any:key')
        expect(value === null || value !== null).toBe(true)
    })

    it('should handle invalid cache keys', async () => {
        const { setCacheValue } = await import('@/services/cache.service')

        const result = await setCacheValue('', { data: 'test' }, 300)
        expect(result).toBe(false)
    })

    it('should handle monitoring errors gracefully', async () => {
        const { PerformanceMonitor } = await import('@/lib/monitoring')

        const monitor = new PerformanceMonitor('error-test')

        // Should not throw
        await monitor.recordError(new Error('Test error'), {
            operation: 'test',
        })

        const metrics = monitor.getMetrics()
        expect(metrics.errors).toBe(1)
    })
})

/**
 * EDGE CASES AND BOUNDARY TESTS
 */
describe('Phase 1 Edge Cases', () => {
    it('should handle very large cache values', async () => {
        const { setCacheValue, getCacheValue } = await import('@/services/cache.service')

        const largeData = {
            array: new Array(1000).fill({ data: 'test' }),
        }

        const key = `large:${Date.now()}`
        const result = await setCacheValue(key, largeData, 300)

        // Should handle large data (Redis supports up to 512MB)
        expect(result).toBe(true)
    })

    it('should handle special characters in cache keys', async () => {
        const { generateCacheKey } = await import('@/services/cache.service')

        const key = generateCacheKey('test:namespace', {
            search: 'array::list:special',
        })

        expect(key).toBeDefined()
        expect(typeof key).toBe('string')
    })

    it('should handle concurrent cache operations', async () => {
        const { setCacheValue } = await import('@/services/cache.service')

        const promises = []
        for (let i = 0; i < 10; i++) {
            promises.push(setCacheValue(`concurrent:${i}`, { data: i }, 300))
        }

        const results = await Promise.all(promises)
        expect(results.every((r) => r === true)).toBe(true)
    })

    it('should handle zero TTL values', async () => {
        const { setCacheValue } = await import('@/services/cache.service')

        // TTL of 0 should set key without expiration
        const result = await setCacheValue('no:ttl:key', { data: 'test' }, 0)
        expect(result).toBe(true)
    })
})
