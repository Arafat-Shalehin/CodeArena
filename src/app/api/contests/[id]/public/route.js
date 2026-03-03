export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { asyncHandler } from '@/lib/asyncHandler'
import { Contest } from '@/models/Contest.models'

/**
 * GET /api/contests/[id]/public
 * Public endpoint — any user (or guest) can view contest details.
 * Does NOT expose isDeleted contests.
 */
export const GET = asyncHandler(async (req, context) => {
    await dbConnect()

    const { id } = await context.params

    const contest = await Contest.findOne({ _id: id, isDeleted: false })
        .populate('problemIds', 'title difficulty')
        .lean()

    if (!contest) {
        return Response.json({ success: false, message: 'Contest not found' }, { status: 404 })
    }

    return Response.json({ success: true, data: contest })
})
