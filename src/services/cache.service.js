import { redisClient } from '@/lib/redis'
import { logger } from '@/lib/logger'

/**
 * @typedef {Object} CacheOptions
 * @property {number} ttl - Time to live in seconds
 * @property {string} [namespace] - Cache key namespace
 * @property {boolean} [compress] - Whether to compress large values
 */

/**
 * Cache configuration and TTL settings
 * All values in seconds
 */
export const CACHE_CONFIG = {
    // Problem-related caches
    PROBLEM_LIST: { ttl: 300, namespace: 'problems:list' }, // 5 minutes
    PROBLEM_DETAIL: { ttl: 600, namespace: 'problem:detail' }, // 10 minutes
    PROBLEM_STATS: { ttl: 1800, namespace: 'problem:stats' }, // 30 minutes
    PROBLEMS_TAGS: { ttl: 86400, namespace: 'problems:tags' }, // 24 hours

    // User-related caches
    USER_STATS: { ttl: 1800, namespace: 'user:stats' }, // 30 minutes
    USER_SUBMISSIONS: { ttl: 600, namespace: 'user:submissions' }, // 10 minutes
    USER_PROFILE: { ttl: 3600, namespace: 'user:profile' }, // 1 hour

    // Recommendation caches
    USER_RECOMMENDATIONS: { ttl: 3600, namespace: 'user:recs' }, // 1 hour
    USER_WEAK_TAGS: { ttl: 1800, namespace: 'user:weak-tags' }, // 30 minutes
    DISCOVERY_PROBLEMS: { ttl: 3600, namespace: 'user:discovery' }, // 1 hour

    // Contest caches
    CONTEST_LIST: { ttl: 300, namespace: 'contests:list' }, // 5 minutes
    CONTEST_DETAIL: { ttl: 600, namespace: 'contest:detail' }, // 10 minutes
    CONTEST_LEADERBOARD: { ttl: 60, namespace: 'contest:leaderboard' }, // 1 minute

    // Search and aggregation caches
    SEARCH_RESULTS: { ttl: 300, namespace: 'search:results' }, // 5 minutes
    AGGREGATION_CACHE: { ttl: 900, namespace: 'aggregation' }, // 15 minutes
}

/**
 * Generate cache key with namespace and parameters
 * Ensures consistent key format across the application
 *
 * @param {string} namespace - Cache namespace (e.g., 'problems:list')
 * @param {Object} params - Parameters to include in key
 * @returns {string} - Formatted cache key
 *
 * @example
 * generateCacheKey('problems:list', { page: 1, limit: 20, difficulty: 'medium' })
 * // Returns: 'problems:list:page:1:limit:20:difficulty:medium'
 */
export function generateCacheKey(namespace, params = {}) {
    if (!namespace || typeof namespace !== 'string') {
        throw new Error('Cache namespace must be a non-empty string')
    }

    let key = namespace

    // Sort params for consistent key generation
    const sortedParams = Object.keys(params)
        .sort()
        .reduce((acc, k) => {
            const value = params[k]
            if (value === null || value === undefined || value === '') {
                return acc
            }
            acc[k] = value
            return acc
        }, {})

    // Build key by appending sorted parameters
    for (const [paramKey, paramValue] of Object.entries(sortedParams)) {
        if (Array.isArray(paramValue)) {
            key += `:${paramKey}:${paramValue.sort().join(',')}`
        } else {
            key += `:${paramKey}:${String(paramValue).replace(/:/g, '_')}`
        }
    }

    return key
}

/**
 * Get value from cache
 * Handles connection errors gracefully
 *
 * @async
 * @param {string} key - Cache key
 * @returns {Promise<?string|Object>} - Cached value or null
 */
export async function getCacheValue(key) {
    if (!key) {
        return null
    }

    try {
        if (!redisClient.isOpen) {
            return null
        }

        const value = await redisClient.get(key)

        if (value) {
            try {
                return JSON.parse(value)
            } catch {
                // Return raw string if JSON parse fails
                return value
            }
        }

        return null
    } catch (error) {
        await logger.system.warn('Cache retrieval error', {
            key,
            error: error.message,
        })
        return null
    }
}

/**
 * Set value in cache with TTL
 * Handles connection errors gracefully
 *
 * @async
 * @param {string} key - Cache key
 * @param {*} value - Value to cache (will be JSON stringified)
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} - Success status
 */
export async function setCacheValue(key, value, ttl = 300) {
    if (!key) {
        return false
    }

    try {
        if (!redisClient.isOpen) {
            return false
        }

        const serialized = typeof value === 'string' ? value : JSON.stringify(value)

        if (ttl > 0) {
            await redisClient.setEx(key, ttl, serialized)
        } else {
            await redisClient.set(key, serialized)
        }

        return true
    } catch (error) {
        await logger.system.warn('Cache write error', {
            key,
            ttl,
            error: error.message,
        })
        return false
    }
}

/**
 * Delete one or more cache keys
 *
 * @async
 * @param {...string} keys - Keys to delete
 * @returns {Promise<number>} - Number of deleted keys
 */
export async function deleteCacheKeys(...keys) {
    if (keys.length === 0) {
        return 0
    }

    try {
        if (!redisClient.isOpen) {
            return 0
        }

        const count = await redisClient.del(keys)
        return count
    } catch (error) {
        await logger.system.warn('Cache deletion error', {
            keysCount: keys.length,
            error: error.message,
        })
        return 0
    }
}

/**
 * Delete all cache keys matching a pattern
 * Useful for invalidating related caches
 *
 * @async
 * @param {string} pattern - Key pattern (supports * wildcard)
 * @returns {Promise<number>} - Number of deleted keys
 */
export async function deleteCachePattern(pattern) {
    if (!pattern) {
        return 0
    }

    try {
        if (!redisClient.isOpen) {
            return 0
        }

        const keys = await redisClient.keys(pattern)
        if (keys.length === 0) {
            return 0
        }

        const count = await redisClient.del(keys)
        return count
    } catch (error) {
        await logger.system.warn('Cache pattern deletion error', {
            pattern,
            error: error.message,
        })
        return 0
    }
}

/**
 * Get or set cache value with automatic fetching
 * If value is in cache, returns cached value
 * Otherwise, calls fetchFn, caches result, and returns it
 *
 * @async
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Async function to fetch value if not cached
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<*>} - Cached or freshly fetched value
 */
export async function getOrSetCache(key, fetchFn, ttl = 300) {
    if (!key || typeof fetchFn !== 'function') {
        throw new Error('Cache key and fetch function are required')
    }

    try {
        // Try to get from cache
        const cached = await getCacheValue(key)
        if (cached !== null) {
            return cached
        }

        // Fetch fresh value
        const fresh = await fetchFn()

        // Cache the result
        if (fresh !== null && fresh !== undefined) {
            await setCacheValue(key, fresh, ttl)
        }

        return fresh
    } catch (error) {
        await logger.system.error('Cache get-or-set error', {
            key,
            error: error.message,
        })
        throw error
    }
}

/**
 * Cache service for problem list queries
 */
export const problemCacheService = {
    /**
     * Generate cache key for problem list
     */
    generateListKey(params) {
        return generateCacheKey(CACHE_CONFIG.PROBLEM_LIST.namespace, {
            page: params.page || 1,
            limit: params.limit || 20,
            difficulty: params.difficulty || 'all',
            search: params.search || '',
            tags: params.tags || '',
            status: params.status || 'all',
            sortBy: params.sortBy || 'recent',
            userId: params.userId || '',
        })
    },

    /**
     * Get cached problem list
     */
    async getList(key) {
        return getCacheValue(key)
    },

    /**
     * Set cached problem list
     */
    async setList(key, data) {
        return setCacheValue(key, data, CACHE_CONFIG.PROBLEM_LIST.ttl)
    },

    /**
     * Generate cache key for problem detail
     */
    generateDetailKey(problemId) {
        return generateCacheKey(CACHE_CONFIG.PROBLEM_DETAIL.namespace, {
            id: problemId,
        })
    },

    /**
     * Get cached problem detail
     */
    async getDetail(problemId) {
        const key = this.generateDetailKey(problemId)
        return getCacheValue(key)
    },

    /**
     * Set cached problem detail
     */
    async setDetail(problemId, data) {
        const key = this.generateDetailKey(problemId)
        return setCacheValue(key, data, CACHE_CONFIG.PROBLEM_DETAIL.ttl)
    },

    /**
     * Invalidate all problem caches
     */
    async invalidateAll() {
        return Promise.all([
            deleteCachePattern(`${CACHE_CONFIG.PROBLEM_LIST.namespace}:*`),
            deleteCachePattern(`${CACHE_CONFIG.PROBLEM_DETAIL.namespace}:*`),
            deleteCachePattern(`${CACHE_CONFIG.PROBLEM_STATS.namespace}:*`),
        ])
    },

    /**
     * Invalidate problem-specific caches
     */
    async invalidateProblem(problemId) {
        return Promise.all([
            deleteCachePattern(`${CACHE_CONFIG.PROBLEM_DETAIL.namespace}:*id:${problemId}*`),
            deleteCachePattern(`${CACHE_CONFIG.PROBLEM_STATS.namespace}:*id:${problemId}*`),
            deleteCachePattern(`${CACHE_CONFIG.PROBLEM_LIST.namespace}:*`),
        ])
    },

    /**
     * Get cached problem tags
     */
    async getTags() {
        const key = generateCacheKey(CACHE_CONFIG.PROBLEMS_TAGS.namespace, {})
        return getCacheValue(key)
    },

    /**
     * Set cached problem tags
     */
    async setTags(tags) {
        const key = generateCacheKey(CACHE_CONFIG.PROBLEMS_TAGS.namespace, {})
        return setCacheValue(key, tags, CACHE_CONFIG.PROBLEMS_TAGS.ttl)
    },
}

/**
 * Cache service for user-related data
 */
export const userCacheService = {
    /**
     * Generate cache key for user stats
     */
    generateStatsKey(userId) {
        return generateCacheKey(CACHE_CONFIG.USER_STATS.namespace, {
            userId,
        })
    },

    /**
     * Get cached user stats
     */
    async getStats(userId) {
        const key = this.generateStatsKey(userId)
        return getCacheValue(key)
    },

    /**
     * Set cached user stats
     */
    async setStats(userId, stats) {
        const key = this.generateStatsKey(userId)
        return setCacheValue(key, stats, CACHE_CONFIG.USER_STATS.ttl)
    },

    /**
     * Generate cache key for user submissions
     */
    generateSubmissionsKey(userId, params = {}) {
        return generateCacheKey(CACHE_CONFIG.USER_SUBMISSIONS.namespace, {
            userId,
            page: params.page || 1,
            limit: params.limit || 20,
            status: params.status || 'all',
        })
    },

    /**
     * Get cached user submissions
     */
    async getSubmissions(userId, params) {
        const key = this.generateSubmissionsKey(userId, params)
        return getCacheValue(key)
    },

    /**
     * Set cached user submissions
     */
    async setSubmissions(userId, params, data) {
        const key = this.generateSubmissionsKey(userId, params)
        return setCacheValue(key, data, CACHE_CONFIG.USER_SUBMISSIONS.ttl)
    },

    /**
     * Invalidate all user caches
     */
    async invalidateAll(userId) {
        return Promise.all([
            deleteCachePattern(`${CACHE_CONFIG.USER_STATS.namespace}:*userId:${userId}*`),
            deleteCachePattern(`${CACHE_CONFIG.USER_SUBMISSIONS.namespace}:*userId:${userId}*`),
            deleteCachePattern(`${CACHE_CONFIG.USER_PROFILE.namespace}:*userId:${userId}*`),
        ])
    },
}

/**
 * Cache service for recommendation data
 */
export const recommendationCacheService = {
    /**
     * Generate cache key for recommendations
     */
    generateKey(userId, params = {}) {
        return generateCacheKey(CACHE_CONFIG.USER_RECOMMENDATIONS.namespace, {
            userId,
            limit: params.limit || 10,
            includeDiscovery: params.includeDiscovery || false,
        })
    },

    /**
     * Get cached recommendations
     */
    async get(userId, params) {
        const key = this.generateKey(userId, params)
        return getCacheValue(key)
    },

    /**
     * Set cached recommendations
     */
    async set(userId, params, data) {
        const key = this.generateKey(userId, params)
        return setCacheValue(key, data, CACHE_CONFIG.USER_RECOMMENDATIONS.ttl)
    },

    /**
     * Generate cache key for weak tags
     */
    generateWeakTagsKey(userId) {
        return generateCacheKey(CACHE_CONFIG.USER_WEAK_TAGS.namespace, {
            userId,
        })
    },

    /**
     * Get cached weak tags
     */
    async getWeakTags(userId) {
        const key = this.generateWeakTagsKey(userId)
        return getCacheValue(key)
    },

    /**
     * Set cached weak tags
     */
    async setWeakTags(userId, tags) {
        const key = this.generateWeakTagsKey(userId)
        return setCacheValue(key, tags, CACHE_CONFIG.USER_WEAK_TAGS.ttl)
    },

    /**
     * Generate cache key for discovery problems
     */
    generateDiscoveryKey(userId, params = {}) {
        return generateCacheKey(CACHE_CONFIG.DISCOVERY_PROBLEMS.namespace, {
            userId,
            limit: params.limit || 5,
        })
    },

    /**
     * Get cached discovery problems
     */
    async getDiscovery(userId, params) {
        const key = this.generateDiscoveryKey(userId, params)
        return getCacheValue(key)
    },

    /**
     * Set cached discovery problems
     */
    async setDiscovery(userId, params, data) {
        const key = this.generateDiscoveryKey(userId, params)
        return setCacheValue(key, data, CACHE_CONFIG.DISCOVERY_PROBLEMS.ttl)
    },

    /**
     * Invalidate all recommendation caches for user
     */
    async invalidateAll(userId) {
        return Promise.all([
            deleteCachePattern(`${CACHE_CONFIG.USER_RECOMMENDATIONS.namespace}:*userId:${userId}*`),
            deleteCachePattern(`${CACHE_CONFIG.USER_WEAK_TAGS.namespace}:*userId:${userId}*`),
            deleteCachePattern(`${CACHE_CONFIG.DISCOVERY_PROBLEMS.namespace}:*userId:${userId}*`),
        ])
    },
}

/**
 * Cache statistics and monitoring
 */
export const cacheStats = {
    /**
     * Get cache info from Redis
     */
    async getInfo() {
        try {
            if (!redisClient.isOpen) {
                return null
            }

            const info = await redisClient.info('stats')
            return info
        } catch (error) {
            await logger.system.warn('Failed to get cache info', {
                error: error.message,
            })
            return null
        }
    },

    /**
     * Get memory usage info
     */
    async getMemoryStats() {
        try {
            if (!redisClient.isOpen) {
                return null
            }

            const info = await redisClient.info('memory')
            return info
        } catch (error) {
            await logger.system.warn('Failed to get memory stats', {
                error: error.message,
            })
            return null
        }
    },

    /**
     * Clear all cache
     */
    async flushAll() {
        try {
            if (!redisClient.isOpen) {
                return false
            }

            await redisClient.flushAll()
            await logger.system.info('Cache flushed')
            return true
        } catch (error) {
            await logger.system.error('Failed to flush cache', {
                error: error.message,
            })
            return false
        }
    },

    /**
     * Get number of keys in cache
     */
    async getKeyCount(pattern = '*') {
        try {
            if (!redisClient.isOpen) {
                return 0
            }

            const keys = await redisClient.keys(pattern)
            return keys.length
        } catch (error) {
            await logger.system.warn('Failed to get key count', {
                error: error.message,
            })
            return 0
        }
    },
}

export default {
    generateCacheKey,
    getCacheValue,
    setCacheValue,
    deleteCacheKeys,
    deleteCachePattern,
    getOrSetCache,
    problemCacheService,
    userCacheService,
    recommendationCacheService,
    cacheStats,
    CACHE_CONFIG,
}
