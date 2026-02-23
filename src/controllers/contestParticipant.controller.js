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

    // Use the ID from the 'user' object for the registration
    const userId = user._id

    // Call your service with the correct IDs
    const participant = await registerUserForContest(contestId, userId)

    return Response.json({ success: true, data: participant }, { status: 201 })
}

/**
 * GET /api/contests/[id]/participants
 * Public leaderboard
 */
export async function getParticipants(req, { params }) {
    const { searchParams } = new URL(req.url)

    const query = {
        page: searchParams.get('page'),
        limit: searchParams.get('limit'),
    }

    const result = await getContestParticipants(params.id, query)

    return Response.json({
        success: true,
        data: result.participants,
        pagination: result.pagination,
    })
}

/**
 * GET /api/contests/[id]/check-registration
 * Requires authentication
 */
export async function checkRegistration(req, { params }) {
    if (!req.user) {
        throw new Error('Unauthorized.')
    }

    const userId = req.user.id
    const contestId = params.id

    let participant = null

    try {
        participant = await getParticipantDetails(contestId, userId)
    } catch {
        participant = null
    }

    return Response.json({
        success: true,
        isRegistered: !!participant,
        data: participant,
    })
}
