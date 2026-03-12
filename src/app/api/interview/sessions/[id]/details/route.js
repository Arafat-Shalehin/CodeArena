import { NextResponse } from 'next/server'
import { protect } from '@/middlewares/auth.middleware'
import { InterviewSession } from '@/models/InterviewSession.model'
import { InterviewMessage } from '@/models/InterviewMessage.model'
import { InterviewSnapshot } from '@/models/InterviewSnapshot.model'
import { InterviewResult } from '@/models/InterviewResult.model'
import { dbConnect } from '@/lib/db'

export async function GET(req, { params }) {
    await dbConnect()

    try {
        const user = await protect(req)
        const { id: sessionId } = await params

        // 1. Verify session ownership
        const session = await InterviewSession.findOne({
            _id: sessionId,
            userId: user.id,
        }).populate('problemIds')

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        // 2. Fetch all related data
        const [messages, snapshots, result] = await Promise.all([
            InterviewMessage.find({ sessionId }).sort({ ts: 1 }),
            InterviewSnapshot.find({ sessionId }).sort({ ts: 1 }),
            InterviewResult.findOne({ sessionId }),
        ])

        return NextResponse.json({
            success: true,
            data: {
                session,
                messages,
                snapshots,
                result,
            },
        })
    } catch (error) {
        console.error('[Session Details API] Error:', error)
        return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 })
    }
}
