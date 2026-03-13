import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { InterviewMessage } from '@/models/InterviewMessage.model'
import { InterviewSnapshot } from '@/models/InterviewSnapshot.model'
import { InterviewSession } from '@/models/InterviewSession.model'
import { getTokenFromCookies } from '@/lib/cookie'
import { verifyToken } from '@/lib/jwt'

export async function GET(req, { params }) {
    try {
        const { id: sessionId } = await params

        // 1. Authenticate user via custom JWT logic
        const token = getTokenFromCookies(req)
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized: No token' }, { status: 401 })
        }

        const decoded = verifyToken(token)
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 })
        }

        await dbConnect()

        // 2. Security Check: Ensure the user owns this session
        const interviewSession = await InterviewSession.findById(sessionId)
        if (!interviewSession) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        if (interviewSession.userId.toString() !== decoded.userId) {
            return NextResponse.json({ error: 'Forbidden: Ownership mismatch' }, { status: 403 })
        }

        // 3. Fetch chat history (last 50 messages)
        const messages = await InterviewMessage.find({ sessionId }).sort({ ts: 1 }).limit(50)

        // 4. Fetch latest code snapshot
        const latestSnapshot = await InterviewSnapshot.findOne({ sessionId }).sort({ ts: -1 })

        return NextResponse.json({
            success: true,
            data: {
                messages: messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                    phase: m.phase,
                    ts: m.ts,
                })),
                latestCode: latestSnapshot?.code || null,
                language: latestSnapshot?.language || null,
            },
        })
    } catch (error) {
        console.error('[Rehydrate API] Error:', error)
        return NextResponse.json(
            { error: 'Failed to rehydrate session', details: error.message },
            { status: 500 }
        )
    }
}
