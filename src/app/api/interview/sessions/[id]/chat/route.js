import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { InterviewSession } from '@/models/InterviewSession.model'
import { InterviewMessage } from '@/models/InterviewMessage.model'
import { protect } from '@/middlewares/auth.middleware'
import { aiEnginePort } from '@/lib/ai-engine'
import {
    acquireProcessingLock,
    updateActivity,
} from '@/services/interviewSession.service'

export async function POST(req, { params }) {
    await dbConnect()

    try {
        const user = await protect(req)
        const { id: sessionId } = await params
        const { content, phase, messageId } = await req.json()

        const session = await InterviewSession.findById(sessionId)
        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        if (session.userId.toString() !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        if (session.isProcessing) {
            return NextResponse.json({ error: 'AI is already responding. Please wait.' }, { status: 429 })
        }

        const lockedSession = await acquireProcessingLock(sessionId)
        if (!lockedSession) {
            return NextResponse.json({ error: 'AI is already responding. Please wait.' }, { status: 429 })
        }

        const userMsg = await InterviewMessage.create({
            sessionId,
            role: 'user',
            phase: session.currentPhase || 'intro',
            content,
            ts: new Date(),
        })

        await updateActivity(sessionId)

        await aiEnginePort.submitChat({
            sessionId,
            userId: user.id,
            content,
            phase: phase || 'coding',
            messageId: messageId || userMsg._id.toString(),
        })

        return NextResponse.json({
            success: true,
            data: userMsg,
        })
    } catch (error) {
        console.error('[Interview Chat API] Error:', error)
        return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 })
    }
}
