/**
 * Health Check API Endpoint
 * Monitors all critical system components
 *
 * GET /api/health - Quick status (minimal, ~50 bytes)
 * GET /api/health?detail=full - Full system status (~500 bytes)
 * GET /api/health?detail=deep - Deep diagnostics (admin only, ~2KB)
 *
 * Response Header: X-Health-Status = 'healthy' | 'degraded' | 'error'
 * Status Codes: 200 (healthy), 503 (degraded), 500 (error), 401 (unauthorized)
 */

import { NextResponse } from 'next/server'
import {
    getHealthStatus,
    getQuickHealthStatus,
    getDetailedHealthContext,
} from '@/services/healthCheck.js'

export const dynamic = 'force-dynamic'

/**
 * GET /api/health
 * Health check with optional detail levels
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const detail = searchParams.get('detail')

        // Level 1: Quick status (default, ~50 bytes)
        if (!detail) {
            const status = await getQuickHealthStatus()
            const statusCode = status.ok ? 200 : 503

            return NextResponse.json(status, {
                status: statusCode,
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'X-Health-Status': status.ok ? 'healthy' : 'degraded',
                },
            })
        }

        // Level 2: Full health status (~500 bytes)
        if (detail === 'full') {
            const status = await getHealthStatus()

            // Determine overall status
            const allHealthy =
                status.services.database.healthy &&
                status.services.redis.healthy &&
                status.services.workers.healthy &&
                status.services.logging.healthy

            const overallStatus = allHealthy ? 'healthy' : 'degraded'
            const statusCode = allHealthy ? 200 : 503

            return NextResponse.json(
                {
                    ...status,
                    overallStatus,
                },
                {
                    status: statusCode,
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'X-Health-Status': overallStatus,
                    },
                }
            )
        }

        // Level 3: Deep diagnostics (admin only, ~2KB)
        if (detail === 'deep') {
            // Check authorization (basic check - in production use JWT)
            const authHeader = request.headers.get('authorization')
            const adminToken = process.env.HEALTH_CHECK_ADMIN_TOKEN

            if (!adminToken || authHeader !== `Bearer ${adminToken}`) {
                return NextResponse.json(
                    { error: 'Unauthorized', message: 'Admin token required for deep diagnostics' },
                    { status: 401 }
                )
            }

            const context = await getDetailedHealthContext()

            return NextResponse.json(context, {
                status: 200,
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                },
            })
        }

        // Unknown detail level - default to quick
        const status = await getQuickHealthStatus()
        const statusCode = status.ok ? 200 : 503

        return NextResponse.json(status, {
            status: statusCode,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'X-Health-Status': status.ok ? 'healthy' : 'degraded',
            },
        })
    } catch (error) {
        console.error('Health check error:', error)

        return NextResponse.json(
            {
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString(),
            },
            {
                status: 500,
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'X-Health-Status': 'error',
                },
            }
        )
    }
}

/**
 * OPTIONS /api/health
 * CORS preflight support
 */
export async function OPTIONS(request) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}
