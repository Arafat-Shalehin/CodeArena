export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { protect } from '@/middlewares/auth.middleware'
import { authorize } from '@/middlewares/role.middleware'
import {
    getSubmissionQueue,
    getAIAnalysisQueue,
    getStatsQueue,
    getInterviewAIQueue,
    getInterviewExecutionQueue,
} from '@/lib/queue'
import { redisClient } from '@/lib/redis'
import { checkDockerAvailability } from '@/lib/docker/executor'
import { Submission } from '@/models/Submission.models'

function percentile(values, p) {
    if (!values.length) return null
    const sorted = [...values].sort((a, b) => a - b)
    const rank = Math.ceil((p / 100) * sorted.length) - 1
    const index = Math.max(0, Math.min(sorted.length - 1, rank))
    return sorted[index]
}

async function getQueueSnapshot(name, queue) {
    try {
        const counts = await queue.getJobCounts(
            'waiting',
            'active',
            'completed',
            'failed',
            'delayed',
            'paused'
        )

        const oldestWaiting = await queue.getJobs(['waiting'], 0, 0, true)
        const oldestWaitingMs = oldestWaiting[0]?.timestamp
            ? Date.now() - Number(oldestWaiting[0].timestamp)
            : 0

        return {
            name,
            healthy: true,
            ...counts,
            oldestWaitingMs,
        }
    } catch (error) {
        return {
            name,
            healthy: false,
            error: error?.message || 'Queue metrics unavailable',
            waiting: 0,
            active: 0,
            completed: 0,
            failed: 0,
            delayed: 0,
            paused: 0,
            oldestWaitingMs: 0,
        }
    }
}

async function getSubmissionStats() {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const [total24h, queuedNow, failed24h, completedRecent] = await Promise.all([
        Submission.countDocuments({ createdAt: { $gte: since24h } }),
        Submission.countDocuments({ status: 'queued' }),
        Submission.countDocuments({ status: 'error', createdAt: { $gte: since24h } }),
        Submission.find({ status: 'completed', createdAt: { $gte: since24h } })
            .select('type executionTime memoryUsed verdict createdAt')
            .sort({ createdAt: -1 })
            .limit(400)
            .lean(),
    ])

    const submitTimes = completedRecent
        .filter((s) => s.type === 'submit' && Number.isFinite(s.executionTime))
        .map((s) => Number(s.executionTime))
    const runTimes = completedRecent
        .filter((s) => s.type === 'run' && Number.isFinite(s.executionTime))
        .map((s) => Number(s.executionTime))

    return {
        total24h,
        queuedNow,
        failed24h,
        completed24h: completedRecent.length,
        runtimeMs: {
            submit: {
                p50: percentile(submitTimes, 50),
                p95: percentile(submitTimes, 95),
            },
            run: {
                p50: percentile(runTimes, 50),
                p95: percentile(runTimes, 95),
            },
        },
    }
}

export async function GET(req) {
    try {
        await dbConnect()

        const user = await protect(req)
        req.user = user
        await authorize(['admin'])(req)

        const [dockerStatus, submissionStats, queueStats] = await Promise.all([
            checkDockerAvailability(),
            getSubmissionStats(),
            Promise.all([
                getQueueSnapshot('submission-queue', getSubmissionQueue()),
                getQueueSnapshot('ai-analysis-queue', getAIAnalysisQueue()),
                getQueueSnapshot('stats-queue', getStatsQueue()),
                getQueueSnapshot('interview-ai', getInterviewAIQueue()),
                getQueueSnapshot('interview-execution', getInterviewExecutionQueue()),
            ]),
        ])

        return NextResponse.json({
            success: true,
            data: {
                generatedAt: new Date().toISOString(),
                infra: {
                    redisConnected: redisClient.isOpen,
                    dockerAvailable: dockerStatus.available,
                    dockerError: dockerStatus.error || null,
                    workerConcurrency: Number.parseInt(
                        process.env.SUBMISSION_WORKER_CONCURRENCY || '4',
                        10
                    ),
                    progressStride: Number.parseInt(
                        process.env.SUBMISSION_PROGRESS_EVENT_STRIDE || '4',
                        10
                    ),
                },
                submissions: submissionStats,
                queues: queueStats,
            },
        })
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Failed to load ops metrics',
            },
            { status: error?.status || 500 }
        )
    }
}
