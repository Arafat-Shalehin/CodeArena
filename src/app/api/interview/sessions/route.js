import { NextResponse } from 'next/server'
import { protect } from '@/middlewares/auth.middleware'
import { InterviewSession } from '@/models/InterviewSession.model'
import { createSession } from '@/services/interviewSession.service'
import dbConnect from '@/lib/mongodb'
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

    // 2.5️⃣ Defensive Validation
    const validModes = ['practice', 'timed', 'company_sim', 'coding', 'mock']

    // Debug: Log the model's enum to confirm HMR update
    console.log(
        '[Debug] InterviewSession Model Enum:',
        InterviewSession.schema.path('mode').enumValues
    )

    if (mode && !validModes.includes(mode)) {
        return NextResponse.json(
            {
                success: false,
                message: `Invalid interview mode: ${mode}. Allowed values: ${validModes.join(', ')}`,
            },
            { status: 400 }
        )
    }

    try {
        // 3️⃣ Create session using the service
        // service already handles active session check, rate limits, and assigns a problem
        const { session, greeting } = await createSession(user.id, mode, durationMins)

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
                greetingMessage: greeting, // Include the synchronous greeting
            },
            { status: 201 }
        )
    } catch (error) {
        // Handle specific error for active session
        if (error.message === 'User already has an active interview session') {
            const activeSession = await InterviewSession.findOne({
                userId: user.id,
                status: 'active',
            })
            return NextResponse.json(
                {
                    error: 'ACTIVE_SESSION_EXISTS',
                    message: error.message,
                    sessionId: activeSession?._id,
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

export const GET = asyncHandler(async (req) => {
    try {
        await dbConnect()
        const user = await protect(req)

        const sessions = await InterviewSession.find({ userId: user.id })
            .populate('problemIds')
            .sort({ startedAt: -1 })

        return NextResponse.json(
            {
                success: true,
                data: sessions || [],
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('[Session API Error]:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch interview sessions',
                error: error.message,
            },
            { status: 500 }
        )
    }
})
