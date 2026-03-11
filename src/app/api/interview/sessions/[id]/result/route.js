import { NextResponse } from 'next/server'
import { protect } from '@/middlewares/auth.middleware'
import { InterviewResult } from '@/models/InterviewResult.model'
import { dbConnect } from '@/lib/db'

export async function GET(req, { params }) {
    await dbConnect()

    try {
        const user = await protect(req)
        const { id: sessionId } = params

        const result = await InterviewResult.findOne({
            sessionId: sessionId,
            userId: user.id,
        })

        if (!result) {
            return NextResponse.json(
                {
                    error: 'NOT_FOUND',
                    message: 'Interview result not found or pending calculation.',
                },
                { status: 404 }
            )
        }

        return NextResponse.json(
            {
                success: true,
                data: result,
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
