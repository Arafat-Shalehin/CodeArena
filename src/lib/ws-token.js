// src/lib/ws-token.js
// WebSocket-specific JWT token generation and verification
// Tokens are shorter-lived and session-specific

import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
const WS_TOKEN_EXPIRY = '1h' // WebSocket tokens live 1 hour
const REFRESH_THRESHOLD = 5 * 60 * 1000 // Refresh token if < 5 min left

/**
 * Generates a short-lived token for WebSocket authentication.
 * Required payload keys: { userId, sessionId }
 * @param {Object} payload — must include userId and sessionId
 * @returns {string} Signed JWT valid for 15 minutes with type: 'websocket'
 */
export function signWsToken(payload) {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required')
    }
    return jwt.sign({ ...payload, type: 'websocket' }, JWT_SECRET, { expiresIn: WS_TOKEN_EXPIRY })
}

export function generateWsToken(userId, sessionData = {}) {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required')
    }

    return jwt.sign(
        {
            userId,
            type: 'websocket',
            sessionId: sessionData.sessionId || null,
            scope: sessionData.scope || 'general', // 'interview', 'submission', etc.
            iat: Math.floor(Date.now() / 1000),
        },
        JWT_SECRET,
        { expiresIn: WS_TOKEN_EXPIRY }
    )
}

export function verifyWsToken(token) {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required')
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET)

        // Verify token type
        if (decoded.type !== 'websocket') {
            throw new Error('Invalid token type')
        }

        return {
            userId: decoded.userId,
            sessionId: decoded.sessionId,
            scope: decoded.scope,
            expiresAt: decoded.exp * 1000,
            issuedAt: decoded.iat * 1000,
        }
    } catch (error) {
        return null
    }
}

/**
 * Check if token needs refreshing (less than REFRESH_THRESHOLD remaining)
 */
export function shouldRefreshWsToken(decoded) {
    if (!decoded?.expiresAt) return true
    const remainingTime = decoded.expiresAt - Date.now()
    return remainingTime < REFRESH_THRESHOLD
}

/**
 * Extract token from multiple sources (order matters)
 */
export function extractWsToken(socket) {
    // 1. Check auth object first (recommended)
    if (socket.handshake?.auth?.token) {
        return socket.handshake.auth.token
    }

    // 2. Check query string
    if (socket.handshake?.query?.token) {
        return socket.handshake.query.token
    }

    // 3. Check cookies
    if (socket.handshake?.headers?.cookie) {
        const match = socket.handshake.headers.cookie.match(/wsToken=([^;]+)/)
        if (match) return match[1]
    }

    return null
}
