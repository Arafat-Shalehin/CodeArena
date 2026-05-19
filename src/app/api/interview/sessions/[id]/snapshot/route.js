import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { InterviewSession } from '@/models/InterviewSession.model'
import { InterviewSnapshot } from '@/models/InterviewSnapshot.model'
import { protect } from '@/middlewares/auth.middleware'

export async function POST(req, { params }) {
    await dbConnect()

    try {
        const user = await protect(req)
        const { id: sessionId } = await params
        const { problemId, language, code, snapshotType } = await req.json()

        const session = await InterviewSession.findById(sessionId)
        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        if (session.userId.toString() !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const snapshot = await InterviewSnapshot.create({
            sessionId,
            problemId,
            language,
            code,
            snapshotType: snapshotType || 'auto',
            ts: new Date(),
        })

        return NextResponse.json({
            success: true,
            data: snapshot,
        })
    } catch (error) {
        console.error('[Interview Snapshot API] Error:', error)
        return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 })
    }
}
