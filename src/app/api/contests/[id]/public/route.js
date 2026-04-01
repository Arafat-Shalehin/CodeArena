import dbConnect from '@/lib/mongodb'
import { asyncHandler } from '@/lib/asyncHandler'
import { getContestById } from '@/services/contest.service'

/**
 * GET /api/contests/[id]/public
 * Public endpoint — any user (or guest) can view contest details.
 * Does NOT expose isDeleted contests.
 */
export const GET = asyncHandler(async (req, context) => {
    await dbConnect()

    const { id } = await context.params

    try {
        const contest = await getContestById(id)
        return Response.json({ success: true, data: contest })
    } catch (error) {
        return Response.json(
            { success: false, message: error.message || 'Contest not found' },
            { status: error.status || 404 }
        )
    }
})
