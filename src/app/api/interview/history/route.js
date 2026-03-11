import { NextResponse } from 'next/server'
import { protect } from '@/middlewares/auth.middleware'
import { InterviewSession } from '@/models/InterviewSession.model'
import { dbConnect } from '@/lib/db'

export async function GET(req) {
    await dbConnect()

    try {
        const user = await protect(req)

        // Fetch query params for pagination
        const url = new URL(req.url)
        const page = parseInt(url.searchParams.get('page') || '1', 10)
        const limit = parseInt(url.searchParams.get('limit') || '10', 10)
        const skip = (page - 1) * limit

        // Retrieve the user's past individual sessions, newest first
        const history = await InterviewSession.find({ userId: user.id })
            .sort({ startedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('problemIds')
            .lean()

        const totalItems = await InterviewSession.countDocuments({ userId: user.id })

        return NextResponse.json(
            {
                success: true,
                data: history,
                pagination: {
                    page,
                    limit,
                    totalItems,
                    totalPages: Math.ceil(totalItems / limit),
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
