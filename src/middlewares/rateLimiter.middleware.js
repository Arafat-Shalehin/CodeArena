import { authLimiter, submissionLimiter, generalLimiter, consumeRateLimit } from '@/lib/rateLimiter'
import { AsyncLocalStorage } from 'async_hooks'

/**
 * Extract IP address from request
 */
function getClientIp(req) {
    return (
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        req.headers.get('cf-connecting-ip') ||
        req.headers.get('x-real-ip') ||
        'unknown'
    )
}

/**
 * Authentication Rate Limiter Middleware
 * 5 attempts per minute per IP
 * Applied to: login, register, password-reset endpoints
 * @param {Request} req - Next.js request
 * @throws {Error} - When rate limit exceeded
 */
export async function authRateLimitMiddleware(req) {
    const ip = getClientIp(req)
    try {
        await consumeRateLimit(authLimiter, ip)
    } catch (error) {
        if (error.isRateLimiterError) {
            const errorResponse = {
                success: false,
                error: 'Too many authentication attempts. Please try again later.',
                retryAfter: error.retryAfter,
            }
            return new Response(JSON.stringify(errorResponse), {
                status: 429, // Too Many Requests
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': error.retryAfter,
                },
            })
        }
        throw error
    }
}

/**
 * Submission Rate Limiter Middleware
 * 3 submissions per 10 seconds per user
 * Applied to: execute, submit, run-code endpoints
 * @param {Request} req - Next.js request
 * @param {string} userId - Authenticated user ID
 * @throws {Error} - When rate limit exceeded
 */
export async function submissionRateLimitMiddleware(req, userId) {
    // Dev UX: keep local iteration fast unless explicitly re-enabled.
    const shouldBypassInDev =
        process.env.NODE_ENV !== 'production' &&
        process.env.SUBMISSION_RATE_LIMIT_DEV_BYPASS !== 'false'
    if (shouldBypassInDev) return null

    if (!userId) {
        throw new Error('User ID required for submission rate limiting')
    }

    try {
        await consumeRateLimit(submissionLimiter, userId)
    } catch (error) {
        if (error.isRateLimiterError) {
            const errorResponse = {
                success: false,
                error: 'Too many submission requests. Please slow down.',
                retryAfter: error.retryAfter,
            }
            return new Response(JSON.stringify(errorResponse), {
                status: 429, // Too Many Requests
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': error.retryAfter,
                },
            })
        }
        throw error
    }
}

/**
 * General API Rate Limiter Middleware
 * 10 requests per second per IP
 * Applied to: All other API endpoints
 * @param {Request} req - Next.js request
 * @returns {Promise<void>}
 */
export async function generalRateLimitMiddleware(req) {
    const ip = getClientIp(req)
    try {
        await consumeRateLimit(generalLimiter, ip)
    } catch (error) {
        if (error.isRateLimiterError) {
            const errorResponse = {
                success: false,
                error: 'Rate limit exceeded. Please try again later.',
                retryAfter: error.retryAfter,
            }
            return new Response(JSON.stringify(errorResponse), {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': error.retryAfter,
                },
            })
        }
        throw error
    }
}
