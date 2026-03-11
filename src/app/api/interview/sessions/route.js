import { NextResponse } from 'next/server'
import { protect } from '@/middlewares/auth.middleware'
import { createSession } from '@/services/interviewSession.service'
import { dbConnect } from '@/lib/db'
import { asyncHandler } from '@/lib/asyncHandler'
import { signWsToken } from '@/lib/auth/wsToken'
import { Problem } from '@/models/Problem.models'

export const POST = asyncHandler(async (req) => {
    await dbConnect()

    // 1️⃣ Authenticate user
    const user = await protect(req)

    // 2️⃣ Parse request body
    const body = await req.json().catch(() => ({}))
    const { mode, durationMins } = body

    try {
        // 3️⃣ Create session using the service
        // service already handles active session check, rate limits, and assigns a problem
        const session = await createSession(user.id, mode, durationMins)

        // 4️⃣ Retrieve the assigned problem details
        const problemId = session.problemIds[0]
        const problem = await Problem.findById(problemId).lean()

        if (!problem) {
            throw new Error('Assigned problem could not be found')
        }

        // 5️⃣ Generate short-lived WebSocket token
        const wsToken = signWsToken({
            userId: user.id,
            sessionId: session._id,
        })

        // Return exactly what the prompt requested
        return NextResponse.json(
            {
                sessionId: session._id,
                problem: problem,
                durationMins: session.durationMins,
                wsToken: wsToken,
                startedAt: session.startedAt,
            },
            { status: 201 }
        )
    } catch (error) {
        // Handle specific error for active session
        if (error.message === 'User already has an active interview session') {
            return NextResponse.json(
                {
                    error: 'ACTIVE_SESSION_EXISTS',
                    message: error.message,
                },
                { status: 409 }
            )
        }

        // Handle rate limit or other errors
        return NextResponse.json(
            {
                error: 'BAD_REQUEST',
                message: error.message,
            },
            { status: error.message && error.message.includes('Rate limit') ? 429 : 400 }
        )
    }
})
