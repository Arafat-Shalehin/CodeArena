// src/app/api/auth/ws-token/route.js
// Endpoint to generate WebSocket authentication tokens
// Clients must call this before connecting to Socket.IO

import { NextResponse } from 'next/server'
import { protect } from '@/middlewares/auth.middleware'
import { generateWsToken } from '@/lib/ws-token'
import { asyncHandler } from '@/lib/asyncHandler'
import { logger } from '@/lib/logger'

/**
 * POST /api/auth/ws-token
 * Generate a WebSocket authentication token for the current user
 *
 * Response:
 * {
 *   success: true,
 *   wsToken: "eyJ0eXAiOiJKV1QiLCJhbGc...",
 *   expiresIn: 3600,
 *   socketUrl: "http://localhost:3002"
 * }
 */
export const POST = asyncHandler(async (req) => {
    // Require user to be authenticated
    const user = await protect(req)

    if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Bypass real-time sockets in serverless mode
    if (process.env.RUNTIME_MODE === 'serverless') {
        return NextResponse.json({
            success: true,
            enabled: false,
            message: 'Real-time WebSocket connections are bypassed in serverless mode.'
        })
    }

    const { sessionId, scope = 'general' } = await req.json()

    // Generate WebSocket token with optional session context
    const wsToken = generateWsToken(user.id || user._id, {
        sessionId,
        scope,
    })

    const parsedSocketPort = Number.parseInt(
        process.env.SOCKET_PORT || process.env.NEXT_PUBLIC_SOCKET_PORT || '3002',
        10
    )
    const socketPort =
        Number.isInteger(parsedSocketPort) && parsedSocketPort > 0 ? parsedSocketPort : 3002

    const forwardedProto = req.headers.get('x-forwarded-proto')
    const forwardedHost = req.headers.get('x-forwarded-host')
    const hostHeader = req.headers.get('host')

    const requestHostRaw = (forwardedHost || hostHeader || req.nextUrl.host || 'localhost')
        .split(',')[0]
        .trim()
    const requestHost = requestHostRaw.replace(/:\d+$/, '') || 'localhost'
    const requestProtocol = (forwardedProto || req.nextUrl.protocol || 'http').replace(':', '')

    const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL || `${requestProtocol}://${requestHost}:${socketPort}`

    void logger.auth
        .info('WebSocket token generated', {
            userId: user.id || user._id,
            scope,
            sessionId: sessionId || null,
        })
        .catch((error) => {
            console.warn('[ws-token] Failed to persist auth log:', error?.message || error)
        })

    return NextResponse.json({
        success: true,
        wsToken,
        expiresIn: 3600, // 1 hour
        socketUrl,
    })
})

/**
 * OPTIONS /api/auth/ws-token
 * CORS preflight for token generation endpoint
 */
export function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}
