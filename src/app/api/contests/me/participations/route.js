export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { asyncHandler } from '@/lib/asyncHandler'
import { protect } from '@/middlewares/auth.middleware'
import { ContestParticipant } from '@/models/ContestParticipant.models'

/**
 * GET /api/contests/me/participations
 * Returns a map of contestId -> { isFinished, score } for the current user
 */
export const GET = asyncHandler(async (req) => {
    await dbConnect()

    const user = await protect(req)
    const userId = user.id

    const participations = await ContestParticipant.find({ userId })
        .select('contestId isFinished score')
        .lean()

    // Convert to a map for O(1) lookup on frontend
    const participationMap = participations.reduce((acc, p) => {
        acc[p.contestId.toString()] = {
            isFinished: p.isFinished || false,
            score: p.score || 0,
        }
        return acc
    }, {})

    return Response.json({
        success: true,
        data: participationMap,
    })
})
