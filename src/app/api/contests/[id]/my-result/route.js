export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { asyncHandler } from '@/lib/asyncHandler'
import { protect } from '@/middlewares/auth.middleware'
import { getContestSummary } from '@/services/leaderboard.service'

/**
 * GET /api/contests/[id]/my-result
 * Restricted to registered participants
 */
export const GET = asyncHandler(async (req, { params }) => {
    await dbConnect()

    const { id: contestId } = await params
    const user = await protect(req)
    const userId = user.id

    try {
        const summary = await getContestSummary(contestId, userId)

        return Response.json({
            success: true,
            data: summary,
        })
    } catch (error) {
        console.error('[API] Failed to fetch contest result:', error)
        return Response.json(
            {
                success: false,
                message: error.message || 'Internal Server Error',
            },
            { status: error.status || 500 }
        )
    }
})
