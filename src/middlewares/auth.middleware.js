import { verifyToken } from '@/lib/jwt'
import { getTokenFromCookies } from '@/lib/cookie'
import { logger } from '@/lib/logger'

/**
 * Extract JWT token from the request
 *
 * Resolution order:
 *   1. Authorization header  (Bearer <token>) — for mobile / Postman / external clients
 *   2. httpOnly cookie        (codearena_access_token) — for browser clients
 *   3. Neither → throw 401
 */
function extractToken(req) {
    // 1️⃣ Try Authorization header first
    const authHeader = req.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1]
    }

    // 2️⃣ Fallback to httpOnly cookie
    const cookieToken = getTokenFromCookies(req)
    if (cookieToken) {
        return cookieToken
    }

    return null
}

/**
 * Authentication middleware
 *
 * Extracts the JWT from header or cookie, verifies it,
 * and returns a standardized user payload.
 *
 * @param {Request} req
 * @returns {Object} decoded user payload { id, role, ... }
 */
export async function protect(req) {
    const token = extractToken(req)

    if (!token) {
        await logger.auth.warn('No token found in header or cookie.', {
            url: req.url,
        })
        const error = new Error('Not authorized. Please login.')
        error.status = 401
        throw error
    }

    try {
        const decoded = verifyToken(token)

        // Standardize user object shape regardless of JWT payload key names
        return {
            id: decoded.id || decoded._id,
            role: decoded.role,
            ...decoded,
        }
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            await logger.auth.warn('Expired JWT token used.', {
                url: req.url,
            })
            const err = new Error('Session expired. Please login again.')
            err.status = 401
            throw err
        }

        await logger.auth.error('Invalid JWT token.', { url: req.url })
        const err = new Error('Invalid token.')
        err.status = 401
        throw err
    }
}
