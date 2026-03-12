import { NextResponse } from 'next/server'
import { protect } from '@/middlewares/auth.middleware'
import { InterviewSession } from '@/models/InterviewSession.model'
import { dbConnect } from '@/lib/db'

export async function GET(req, { params }) {
    await dbConnect()

    try {
        const user = await protect(req)
        const { id: sessionId } = params

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

        return NextResponse.json(
            {
                success: true,
                data: session,
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
