import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { InterviewMessage } from '@/models/InterviewMessage.model'
import { InterviewSnapshot } from '@/models/InterviewSnapshot.model'
import { InterviewSession } from '@/models/InterviewSession.model'
import { Problem } from '@/models/Problem.models'
import { protect } from '@/middlewares/auth.middleware'
import { signWsToken } from '@/lib/auth/wsToken'
import { asyncHandler } from '@/lib/asyncHandler'
import { redisClient } from '@/lib/redis'
import { aiEnginePort } from '@/lib/ai-engine'
import { releaseProcessingLock } from '@/services/interviewSession.service'

export const dynamic = 'force-dynamic'

export const GET = asyncHandler(async (req, { params }) => {
    await dbConnect()

    // 1. Authenticate user via standardized middleware
    const user = await protect(req)
    const { id: sessionId } = await params

    // 2. Security Check: Ensure the user owns this session
    const interviewSession = await InterviewSession.findById(sessionId).populate('problemIds')
    if (!interviewSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (interviewSession.userId.toString() !== user.id) {
        return NextResponse.json({ error: 'Forbidden: Ownership mismatch' }, { status: 403 })
    }

    // 3. Fetch chat history
    const messages = await InterviewMessage.find({ sessionId }).sort({ ts: 1 }).limit(100)

    // 4. Fetch latest code snapshot
    const latestSnapshot = await InterviewSnapshot.findOne({ sessionId }).sort({ ts: -1 })

    // 5. Generate fresh WebSocket token
    const wsToken = signWsToken({
        userId: user.id,
        sessionId: interviewSession._id,
    })

    // 6. Get problem details
    const problem = await Problem.findById(interviewSession.problemIds[0]).lean()

    // 7. Check for partial ghost stream vs active stream
    let currentStreamingMessage = null
    if (redisClient.isOpen) {
        try {
            const streamKey = `interview:stream:${sessionId}`
            const cachedStream = await redisClient.hGetAll(streamKey)

            if (cachedStream && Object.keys(cachedStream).length > 0) {
                const activeJobExists = await aiEnginePort.hasActiveJob(sessionId)

                const lastUpdated = parseInt(cachedStream.lastUpdated || '0', 10)
                const isExpired = Date.now() - lastUpdated > 60000

                if (!activeJobExists || isExpired) {
                    // Ghost stream detected -> release lock & wipe
                    await releaseProcessingLock(sessionId).catch(() => {})
                    await redisClient.del(streamKey)
                } else {
                    currentStreamingMessage = {
                        messageId: cachedStream.messageId,
                        content: cachedStream.content,
                        sequence: parseInt(cachedStream.sequence || '0', 10),
                    }
                }
            }
        } catch (e) {
            console.error('[Rehydrate] Error checking partial stream:', e)
        }
    }

    return NextResponse.json({
        success: true,
        data: {
            sessionId: interviewSession._id,
            status: interviewSession.status,
            problem: problem,
            wsToken: wsToken,
            durationMins: interviewSession.durationMins,
            startedAt: interviewSession.startedAt,
            currentPhase: interviewSession.currentPhase,
            messages: messages.map((m) => ({
                id: m.id || m._id, // Ensure persistent ID for frontend matching
                role: m.role,
                content: m.content,
                phase: m.phase,
                ts: m.ts,
            })),
            currentStreamingMessage,
            latestCode: latestSnapshot?.code || null,
            language: latestSnapshot?.language || null,
        },
    })
})
