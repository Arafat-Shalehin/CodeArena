import { NextResponse } from 'next/server'
import {
    registerUserForContest,
    getContestParticipants,
    getParticipantDetails,
} from '@/services/contestParticipant.service'

/**
 * POST /api/contests/[id]/register
 * Requires authentication
 */
export async function register(req, context, user) {
    // Use the 'user' object passed from the route
    if (!user) {
        return Response.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }

    // Extract the contest ID from params
    const { id: contestId } = await context.params
    const userId = user._id

    // Call your service with the correct IDs
    try {
        const participant = await registerUserForContest(contestId, userId)
        return NextResponse.json({ success: true, data: participant }, { status: 201 })
    } catch (error) {
        console.error('Registration Controller Error:', error)
        return NextResponse.json(
            { success: false, message: error.message || 'Registration failed.' },
            { status: error.status || 500 }
        )
    }
}

/**
 * GET /api/contests/[id]/participants
 * Public leaderboard
 */
export async function getParticipants(req, context) {
    const { params } = context
    const { id: contestId } = await params
    const { searchParams } = new URL(req.url)

    const query = {
        page: searchParams.get('page'),
        limit: searchParams.get('limit'),
    }

    const result = await getContestParticipants(contestId, query)

    return NextResponse.json({
        success: true,
        data: result.participants,
        pagination: result.pagination,
    })
}

/**
 * GET /api/contests/[id]/check-registration
 * Requires authentication
 */
export async function checkRegistration(req, context) {
    if (!req.user) {
        throw new Error('Unauthorized.')
    }

    const { id: contestId } = await context.params
    const userId = req.user.id

    let participant = null

    try {
        participant = await getParticipantDetails(contestId, userId)
    } catch {
        participant = null
    }

    return NextResponse.json({
        success: true,
        isRegistered: !!participant,
        data: participant,
    })
}
