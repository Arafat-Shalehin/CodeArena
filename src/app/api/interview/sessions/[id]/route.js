import { NextResponse } from 'next/server'
import { protect } from '@/middlewares/auth.middleware'
import { InterviewSession } from '@/models/InterviewSession.model'
import dbConnect from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET(req, { params }) {
    await dbConnect()

    try {
        const user = await protect(req)
        const { id: sessionId } = await params

        // Find the session and ensure it belongs to the user
        const session = await InterviewSession.findOne({
            _id: sessionId,
            userId: user.id,
        }).populate('problemIds')

        if (!session) {
            return NextResponse.json(
                {
                    error: 'NOT_FOUND',
                    message: 'Interview session not found',
                },
                { status: 404 }
            )
        }

        // Fetch messages to include the greeting for mount
        const { InterviewMessage } = await import('@/models/InterviewMessage.model')
        const messages = await InterviewMessage.find({ sessionId }).sort({ ts: 1 })

        return NextResponse.json(
            {
                success: true,
                data: {
                    ...session.toObject(),
                    messages,
                },
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
