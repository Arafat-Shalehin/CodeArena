// src/lib/socket-auth.js
// Socket.IO authentication and authorization middleware

import { verifyWsToken, extractWsToken } from '@/lib/ws-token'
import { User } from '@/models/User.models'

/**
 * Global middleware for all Socket.IO connections
 * Validates token and attaches user info to socket
 */
export function createAuthMiddleware() {
    return async (socket, next) => {
        try {
            // Extract token from multiple sources
            const token = extractWsToken(socket)

            if (!token) {
                return next(new Error('AUTH_MISSING_TOKEN'))
            }

            // Verify token signature and expiry
            const decoded = verifyWsToken(token)
            if (!decoded) {
                return next(new Error('AUTH_INVALID_TOKEN'))
            }

            // Verify user still exists in database
            const user = await User.findById(decoded.userId).select('_id email role status')
            if (!user) {
                return next(new Error('AUTH_USER_NOT_FOUND'))
            }

            // Check if user is active
            if (user.status === 'banned' || user.status === 'suspended') {
                return next(new Error('AUTH_USER_INACTIVE'))
            }

            // Attach to socket
            socket.userId = decoded.userId
            socket.user = {
                id: user._id,
                email: user.email,
                role: user.role,
            }
            socket.wsToken = token
            socket.sessionId = decoded.sessionId
            socket.scope = decoded.scope

            next()
        } catch (error) {
            console.error('[Socket.IO Auth] Error:', error.message)
            next(new Error('AUTH_ERROR'))
        }
    }
}

/**
 * Middleware for specific namespaces requiring additional scope validation
 */
export function createScopeMiddleware(requiredScope) {
    return async (socket, next) => {
        if (socket.scope !== requiredScope && socket.scope !== 'admin') {
            return next(new Error(`AUTH_INVALID_SCOPE: requires ${requiredScope}`))
        }
        next()
    }
}

/**
 * Middleware for role-based access control
 */
export function createRoleMiddleware(allowedRoles = ['user', 'admin']) {
    return async (socket, next) => {
        if (!allowedRoles.includes(socket.user?.role)) {
            return next(new Error('AUTH_INSUFFICIENT_ROLE'))
        }
        next()
    }
}

/**
 * Rate limiting middleware for Socket.IO
 */
export function createRateLimitMiddleware(redis, windowMs = 60000, maxConnections = 10) {
    const connectedUsers = new Map()

    return async (socket, next) => {
        const userId = socket.userId
        const key = `socket:connect:${userId}`

        try {
            const currentCount = await redis.incr(key)

            if (currentCount === 1) {
                // First connection in this window, set expiry
                await redis.expire(key, Math.ceil(windowMs / 1000))
            }

            if (currentCount > maxConnections) {
                return next(new Error('AUTH_RATE_LIMIT_EXCEEDED'))
            }

            // Track for cleanup
            connectedUsers.set(userId, (connectedUsers.get(userId) || 0) + 1)

            // Cleanup on disconnect
            socket.on('disconnect', () => {
                const count = connectedUsers.get(userId) || 1
                if (count <= 1) {
                    connectedUsers.delete(userId)
                } else {
                    connectedUsers.set(userId, count - 1)
                }
            })

            next()
        } catch (error) {
            console.error('[Socket.IO RateLimit] Error:', error.message)
            next(new Error('AUTH_RATE_LIMIT_ERROR'))
        }
    }
}

/**
 * Error handler for auth failures
 */
export function handleAuthError(socket, error) {
    const errorMap = {
        AUTH_MISSING_TOKEN: 'Authentication token is required',
        AUTH_INVALID_TOKEN: 'Invalid or expired authentication token',
        AUTH_USER_NOT_FOUND: 'User not found',
        AUTH_USER_INACTIVE: 'User account is inactive',
        AUTH_ERROR: 'Authentication error occurred',
        AUTH_INVALID_SCOPE: 'Insufficient permissions for this operation',
        AUTH_INSUFFICIENT_ROLE: 'Insufficient role permissions',
        AUTH_RATE_LIMIT_EXCEEDED: 'Too many connections, please try again later',
        AUTH_RATE_LIMIT_ERROR: 'Rate limit error occurred',
    }

    const message = errorMap[error.message] || error.message || 'Authentication failed'
    console.warn(`[Socket.IO] Connection rejected: ${error.message}`, {
        socketId: socket.id,
        userId: socket.userId,
    })

    socket.emit('auth_error', { code: error.message, message })
    socket.disconnect(true)
}
