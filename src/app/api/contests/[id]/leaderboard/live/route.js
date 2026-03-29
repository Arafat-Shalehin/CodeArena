export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { asyncHandler } from '@/lib/asyncHandler'
import { ContestParticipant } from '@/models/ContestParticipant.models'

/**
 * GET /api/contests/[id]/leaderboard/live
 * Public live leaderboard — sorted by score DESC, lastSubmissionAt ASC.
 * Polled every ~5s by the arena client.
 */
export const GET = asyncHandler(async (req, context) => {
    await dbConnect()

    const { id } = await context.params

    const participants = await ContestParticipant.find({ contestId: id })
        .populate('userId', 'name username photoURL')
        .sort({ score: -1, lastSubmissionAt: 1 })
        .limit(50)
        .lean()

    const ranked = participants.map((p, i) => ({ ...p, rank: i + 1 }))

    return Response.json({ success: true, data: ranked })
})
