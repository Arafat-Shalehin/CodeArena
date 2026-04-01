import {
    computeLeaderboard,
    getLeaderboard,
    getUserRank,
    resetLeaderboard,
} from '@/services/leaderboard.service'

/**
 * POST /api/contests/[id]/leaderboard/finalize
 * Admin only
 */
export async function finalizeLeaderboard(req, { params }) {
    const { id: contestId } = await params

    const result = await computeLeaderboard(contestId)

    return Response.json(
        {
            success: true,
            message: 'Leaderboard finalized successfully.',
            data: result,
        },
        { status: 201 }
    )
}

/**
 * GET /api/contests/[id]/leaderboard
 * Public
 */
export async function fetchLeaderboard(req, context) {
    const params = await context.params
    const contestId = params?.id
    if (!contestId) {
        console.log('⚠️ Contest ID missing in context:', context)
        return Response.json({ success: false, message: 'Contest ID missing' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const query = {
        page: searchParams.get('page'),
        limit: searchParams.get('limit'),
    }

    const result = await getLeaderboard(contestId, query)

    return Response.json({
        success: true,
        data: result.leaderboard,
        pagination: result.pagination,
    })
}

/**
 * GET /api/contests/[id]/leaderboard/me
 * Authenticated user
 */
export async function fetchMyRank(req, { params }) {
    const { id: contestId } = await params
    const userId = req.user.id

    const result = await getUserRank(contestId, userId)

    return Response.json({
        success: true,
        data: result,
    })
}

/**
 * DELETE /api/contests/[id]/leaderboard
 * Admin only
 */
export async function deleteLeaderboard(req, { params }) {
    const { id: contestId } = await params

    const result = await resetLeaderboard(contestId)

    return Response.json({
        success: true,
        message: 'Leaderboard reset successfully.',
        data: result,
    })
}
