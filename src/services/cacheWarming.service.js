import { Problem } from '@/models/Problem.models'
import { redisClient } from '@/lib/redis'
import { logger } from '@/lib/logger'
import { problemCacheService, CACHE_CONFIG } from '@/services/cache.service'

/**
 * Cache warming service
 * Pre-populates cache with frequently accessed data during application startup
 * Improves initial load times and reduces database pressure
 */

/**
 * @typedef {Object} WarmingConfig
 * @property {number} batchSize - Number of items to warm per batch
 * @property {number} delayBetweenBatches - Delay between batches in ms
 * @property {boolean} enabled - Whether warming is enabled
 * @property {Array<string>} difficulties - Difficulties to warm
 * @property {Array<string>} sortStrategies - Sort strategies to warm
 */

/**
 * Default cache warming configuration
 */
const WARMING_CONFIG = {
    batchSize: 5,
    delayBetweenBatches: 100,
    enabled: process.env.NODE_ENV !== 'test',
    difficulties: ['easy', 'medium', 'hard'],
    sortStrategies: ['createdAt', 'acceptanceRate', 'totalSubmissions'],
    warmingTimeout: 30000, // 30 seconds max
}

/**
 * Sleep utility for delays between batches
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Check if Redis is available
 * @returns {boolean}
 */
function isRedisAvailable() {
    return redisClient && redisClient.isOpen
}

/**
 * Warm popular problem lists with different filters and sorts
 *
 * @async
 * @returns {Promise<Object>} - Warming results
 */
export async function warmProblemLists() {
    const results = {
        success: false,
        cached: 0,
        failed: 0,
        duration: 0,
        errors: [],
    }

    const startTime = Date.now()

    if (!isRedisAvailable()) {
        await logger.system.warn('Cache warming skipped: Redis unavailable')
        return results
    }

    try {
        await logger.system.info('Starting problem list cache warming')

        // Warm all combinations of difficulties and sorts
        const combinations = []
        for (const difficulty of WARMING_CONFIG.difficulties) {
            for (const sortBy of WARMING_CONFIG.sortStrategies) {
                combinations.push({ difficulty, sortBy })
            }
        }

        // Add "all difficulties" combinations
        for (const sortBy of WARMING_CONFIG.sortStrategies) {
            combinations.push({ difficulty: 'all', sortBy })
        }

        // Warm each combination
        for (const combo of combinations) {
            try {
                const params = {
                    page: 1,
                    limit: 20,
                    difficulty: combo.difficulty === 'all' ? null : combo.difficulty,
                    sortBy: combo.sortBy,
                }

                const cacheKey = problemCacheService.generateListKey(params)
                const cachedValue = await problemCacheService.getList(cacheKey)

                // Skip if already cached
                if (cachedValue) {
                    results.cached++
                    continue
                }

                // Fetch from database
                const filter = {}
                if (combo.difficulty !== 'all') {
                    filter.difficulty = combo.difficulty
                }

                let query = Problem.find(filter).select('-sampleTestCases -specialJudgeCode').lean()

                // Apply sorting
                switch (combo.sortBy) {
                    case 'createdAt':
                        query = query.sort({ createdAt: -1 })
                        break
                    case 'acceptanceRate':
                        // Note: acceptanceRate is computed, need to sort by acceptance metrics
                        query = query.sort({ acceptedSubmissions: -1 })
                        break
                    case 'totalSubmissions':
                        query = query.sort({ totalSubmissions: -1 })
                        break
                }

                const problems = await query.limit(20).exec()

                // Cache the result
                await problemCacheService.setList(cacheKey, {
                    data: problems,
                    pagination: {
                        total: await Problem.countDocuments(filter),
                        page: 1,
                        limit: 20,
                    },
                })

                results.cached++
            } catch (error) {
                results.failed++
                results.errors.push(
                    `Failed to warm combo ${combo.difficulty}/${combo.sortBy}: ${error.message}`
                )
            }
        }

        results.success = results.failed === 0
        results.duration = Date.now() - startTime

        await logger.system.info('Problem list cache warming completed', {
            cached: results.cached,
            failed: results.failed,
            duration: `${results.duration}ms`,
        })

        return results
    } catch (error) {
        results.duration = Date.now() - startTime
        results.errors.push(error.message)

        await logger.system.error('Problem list cache warming failed', {
            error: error.message,
            duration: `${results.duration}ms`,
        })

        return results
    }
}

/**
 * Warm problem tags cache
 *
 * @async
 * @returns {Promise<Object>} - Warming results
 */
export async function warmProblemTags() {
    const results = {
        success: false,
        duration: 0,
        errors: [],
    }

    const startTime = Date.now()

    if (!isRedisAvailable()) {
        await logger.system.warn('Tags warming skipped: Redis unavailable')
        return results
    }

    try {
        await logger.system.info('Starting problem tags cache warming')

        // Get distinct tags
        const tags = await Problem.distinct('tags')

        if (!tags || tags.length === 0) {
            await logger.system.warn('No tags found for warming')
            results.duration = Date.now() - startTime
            results.success = true
            return results
        }

        // Cache tags
        await problemCacheService.setTags(tags)

        results.success = true
        results.duration = Date.now() - startTime

        await logger.system.info('Problem tags cache warming completed', {
            tagCount: tags.length,
            duration: `${results.duration}ms`,
        })

        return results
    } catch (error) {
        results.duration = Date.now() - startTime
        results.errors.push(error.message)

        await logger.system.error('Problem tags cache warming failed', {
            error: error.message,
            duration: `${results.duration}ms`,
        })

        return results
    }
}

/**
 * Warm problem detail caches for popular problems
 *
 * @async
 * @param {number} limit - Number of problems to warm (default 10)
 * @returns {Promise<Object>} - Warming results
 */
export async function warmPopularProblemDetails(limit = 10) {
    const results = {
        success: false,
        cached: 0,
        failed: 0,
        duration: 0,
        errors: [],
    }

    const startTime = Date.now()

    if (!isRedisAvailable()) {
        await logger.system.warn('Problem details warming skipped: Redis unavailable')
        return results
    }

    try {
        await logger.system.info('Starting popular problem details cache warming', {
            limit,
        })

        // Get most popular problems (by total submissions)
        const problems = await Problem.find()
            .sort({ totalSubmissions: -1 })
            .limit(limit)
            .lean()
            .exec()

        for (const problem of problems) {
            try {
                const cacheKey = problemCacheService.generateDetailKey(problem._id)
                const cachedValue = await problemCacheService.getDetail(problem._id)

                // Skip if already cached
                if (cachedValue) {
                    results.cached++
                    continue
                }

                // Cache the problem detail
                await problemCacheService.setDetail(problem._id, problem)
                results.cached++
            } catch (error) {
                results.failed++
                results.errors.push(`Failed to warm problem ${problem._id}: ${error.message}`)
            }
        }

        results.success = results.failed === 0
        results.duration = Date.now() - startTime

        await logger.system.info('Popular problem details cache warming completed', {
            cached: results.cached,
            failed: results.failed,
            duration: `${results.duration}ms`,
        })

        return results
    } catch (error) {
        results.duration = Date.now() - startTime
        results.errors.push(error.message)

        await logger.system.error('Problem details cache warming failed', {
            error: error.message,
            duration: `${results.duration}ms`,
        })

        return results
    }
}

/**
 * Complete cache warming routine
 * Warms multiple cache layers with timeout protection
 *
 * @async
 * @param {Object} options - Warming options
 * @returns {Promise<Object>} - Comprehensive warming results
 */
export async function performCacheWarming(options = {}) {
    const {
        warmLists = true,
        warmTags = true,
        warmDetails = true,
        detailLimit = 10,
        timeout = WARMING_CONFIG.warmingTimeout,
    } = options

    const results = {
        success: false,
        startTime: new Date().toISOString(),
        duration: 0,
        sections: {},
        totalCached: 0,
        totalFailed: 0,
        errors: [],
    }

    const operationStartTime = Date.now()

    if (!WARMING_CONFIG.enabled) {
        await logger.system.info('Cache warming disabled')
        results.success = true
        return results
    }

    if (!isRedisAvailable()) {
        await logger.system.warn('Cache warming skipped: Redis unavailable')
        results.success = true
        return results
    }

    try {
        await logger.system.info('Cache warming started', {
            warmLists,
            warmTags,
            warmDetails,
            timeout: `${timeout}ms`,
        })

        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => {
                reject(new Error(`Cache warming timeout after ${timeout}ms`))
            }, timeout)
        )

        const warmingPromises = []

        if (warmLists) {
            warmingPromises.push(
                Promise.race([warmProblemLists(), timeoutPromise]).then((result) => {
                    results.sections.lists = result
                    results.totalCached += result.cached || 0
                    results.totalFailed += result.failed || 0
                    if (result.errors?.length) {
                        results.errors.push(...result.errors)
                    }
                })
            )
        }

        if (warmTags) {
            warmingPromises.push(
                Promise.race([warmProblemTags(), timeoutPromise]).then((result) => {
                    results.sections.tags = result
                    if (result.errors?.length) {
                        results.errors.push(...result.errors)
                    }
                })
            )
        }

        if (warmDetails) {
            warmingPromises.push(
                Promise.race([warmPopularProblemDetails(detailLimit), timeoutPromise]).then(
                    (result) => {
                        results.sections.details = result
                        results.totalCached += result.cached || 0
                        results.totalFailed += result.failed || 0
                        if (result.errors?.length) {
                            results.errors.push(...result.errors)
                        }
                    }
                )
            )
        }

        // Execute all warming tasks
        await Promise.all(warmingPromises)

        results.success = results.totalFailed === 0
        results.duration = Date.now() - operationStartTime
        results.endTime = new Date().toISOString()

        await logger.system.info('Cache warming completed successfully', {
            success: results.success,
            cached: results.totalCached,
            failed: results.totalFailed,
            duration: `${results.duration}ms`,
            sections: Object.keys(results.sections),
        })

        return results
    } catch (error) {
        results.duration = Date.now() - operationStartTime
        results.endTime = new Date().toISOString()
        results.errors.push(error.message)
        results.success = false

        await logger.system.error('Cache warming failed', {
            error: error.message,
            duration: `${results.duration}ms`,
            sections: Object.keys(results.sections),
        })

        return results
    }
}

/**
 * Clear all warmed caches
 * Useful for testing or maintenance
 *
 * @async
 * @returns {Promise<Object>} - Clearing results
 */
export async function clearWarmedCaches() {
    const results = {
        success: false,
        deleted: 0,
        duration: 0,
        errors: [],
    }

    const startTime = Date.now()

    if (!isRedisAvailable()) {
        return results
    }

    try {
        await logger.system.info('Clearing warmed caches')

        // Delete all problem-related cache keys
        const patterns = [
            `${CACHE_CONFIG.PROBLEM_LIST.namespace}:*`,
            `${CACHE_CONFIG.PROBLEM_DETAIL.namespace}:*`,
            `${CACHE_CONFIG.PROBLEMS_TAGS.namespace}:*`,
        ]

        for (const pattern of patterns) {
            const keys = await redisClient.keys(pattern)
            if (keys.length > 0) {
                const deleted = await redisClient.del(keys)
                results.deleted += deleted
            }
        }

        results.success = true
        results.duration = Date.now() - startTime

        await logger.system.info('Warmed caches cleared', {
            deleted: results.deleted,
            duration: `${results.duration}ms`,
        })

        return results
    } catch (error) {
        results.duration = Date.now() - startTime
        results.errors.push(error.message)

        await logger.system.error('Failed to clear warmed caches', {
            error: error.message,
        })

        return results
    }
}

/**
 * Get warming status
 * Returns information about current cache warming state
 *
 * @async
 * @returns {Promise<Object>} - Warming status
 */
export async function getWarmingStatus() {
    const status = {
        enabled: WARMING_CONFIG.enabled,
        redisAvailable: isRedisAvailable(),
        cacheHealth: {
            listsCount: 0,
            detailsCount: 0,
            tagsCount: 0,
        },
    }

    if (!isRedisAvailable()) {
        return status
    }

    try {
        status.cacheHealth.listsCount = await redisClient
            .keys(`${CACHE_CONFIG.PROBLEM_LIST.namespace}:*`)
            .then((keys) => keys.length)

        status.cacheHealth.detailsCount = await redisClient
            .keys(`${CACHE_CONFIG.PROBLEM_DETAIL.namespace}:*`)
            .then((keys) => keys.length)

        status.cacheHealth.tagsCount = await redisClient
            .keys(`${CACHE_CONFIG.PROBLEMS_TAGS.namespace}:*`)
            .then((keys) => keys.length)
    } catch (error) {
        await logger.system.warn('Failed to get warming status', {
            error: error.message,
        })
    }

    return status
}

export default {
    performCacheWarming,
    warmProblemLists,
    warmProblemTags,
    warmPopularProblemDetails,
    clearWarmedCaches,
    getWarmingStatus,
    WARMING_CONFIG,
}
