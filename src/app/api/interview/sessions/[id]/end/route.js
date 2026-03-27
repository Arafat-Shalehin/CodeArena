import { NextResponse } from 'next/server'
import { protect } from '@/middlewares/auth.middleware'
import { terminateSession } from '@/services/interviewSession.service'
import { InterviewSession } from '@/models/InterviewSession.model'
import dbConnect from '@/lib/mongodb'

export async function POST(req, { params }) {
    await dbConnect()

    try {
        const user = await protect(req)
        const { id: sessionId } = await params

        // Verify ownership
        const session = await InterviewSession.findOne({
            _id: sessionId,
            userId: user.id,
        })

        if (!session) {
            return NextResponse.json(
                {
                    error: 'NOT_FOUND',
                    message: 'Interview session not found',
                },
                { status: 404 }
            )
        }

        if (session.status !== 'active') {
            // Idempotent return to prevent race conditions (e.g., timer expired + user clicked end)
            return NextResponse.json(
                {
                    success: true,
                    data: session,
                    message: 'Session is already inactive',
                },
                { status: 200 }
            )
        }

        // Terminate session via service (handles DB + Redis cleanup)
        const terminatedSession = await terminateSession(sessionId)

        return NextResponse.json(
            {
                success: true,
                data: terminatedSession,
            },
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json(
            {
                error: 'SERVER_ERROR',
                message: error.message,
            },
            { status: error.status || 500 }
        )
    }
}
