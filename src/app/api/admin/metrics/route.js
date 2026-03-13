import { NextResponse } from 'next/server'
import { register, Gauge, Counter } from 'prom-client'
import { protect } from '@/middlewares/auth.middleware'

// Standard System Metrics
// (prom-client usually collects default metrics automatically if configured,
// but we'll add some custom ones for the Interview system)

const activeInterviews = new Gauge({
    name: 'interview_active_sessions_total',
    help: 'Total number of active interview sessions',
})

const snapshotProcessed = new Counter({
    name: 'interview_snapshots_total',
    help: 'Total number of code snapshots processed',
    labelNames: ['type'],
})

const aiMessageLatency = new Gauge({
    name: 'interview_ai_latency_seconds',
    help: 'Latency of AI interview responses',
})

export async function GET(req) {
    try {
        // 1. Authenticate (Admin only)
        const user = await protect(req)
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
        }

        // 2. Return metrics in Prometheus format
        return new Response(await register.metrics(), {
            headers: { 'Content-Type': register.contentType },
        })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }
}

// Export metrics for use in other parts of the app
export { activeInterviews, snapshotProcessed, aiMessageLatency }
