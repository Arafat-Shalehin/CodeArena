import { RateLimiterRedis } from 'rate-limiter-flexible'
import { redisClient } from './redis.js'

/**
 * Rate Limiter: 10 requests per second per IP/User
 * Used for: General API protection
 */
export const generalLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rl:general',
    points: 10, // 10 requests
    duration: 1, // per 1 second
    blockDurationMs: 60000, // Block for 60 seconds after exceeding
})

/**
 * Rate Limiter: 5 authentication attempts per minute per IP
 * Used for: Login, Register, Password reset
 * Prevents: Brute-force attacks
 */
export const authLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rl:auth',
    points: 5, // 5 attempts
    duration: 60, // per 60 seconds
    blockDurationMs: 300000, // Block for 5 minutes after exceeding
})

/**
 * Rate Limiter: 3 submissions per 10 seconds per user
 * Used for: Code execution and submission endpoints
 * Prevents: Spam submissions and resource exhaustion
 */
export const submissionLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rl:submission',
    points: 3, // 3 submissions
    duration: 10, // per 10 seconds
    blockDurationMs: 60000, // Block for 1 minute after exceeding
})

/**
 * Consume rate limit points
 * @param {RateLimiterRedis} limiter - The rate limiter instance
 * @param {string} key - Unique identifier (IP, userId, etc)
 * @returns {Promise<void>}
 * @throws {Error} - When rate limit exceeded
 */
export async function consumeRateLimit(limiter, key) {
    try {
        await limiter.consume(key)
    } catch (rejRes) {
        const secondsLeft = Math.round(rejRes.msBeforeNext / 1000) || 1
        const error = new Error(`Too many requests. Try again in ${secondsLeft}s`)
        error.retryAfter = secondsLeft
        error.points = rejRes.points
        error.isRateLimiterError = true
        throw error
    }
}

/**
 * Get rate limiter info for a key
 * @param {RateLimiterRedis} limiter
 * @param {string} key
 * @returns {Promise<object>}
 */
export async function getRateLimiterStatus(limiter, key) {
    try {
        const res = await limiter.get(key)
        return {
            points: res.points,
            remainingPoints: res.remainingPoints,
            isBlocked: res.isBlocked,
            resetTime: new Date(res.resetTime),
        }
    } catch (err) {
        return { error: 'Failed to get rate limiter status' }
    }
}
