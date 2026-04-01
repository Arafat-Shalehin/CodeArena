export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { asyncHandler } from '@/lib/asyncHandler'
import { protect } from '@/middlewares/auth.middleware'
import { finishContestForUser } from '@/services/contestParticipant.service'

/**
 * POST /api/contests/[id]/finish
 */
export const POST = asyncHandler(async (req, { params }) => {
    await dbConnect()

    const { id: contestId } = await params
    const user = await protect(req)
    const userId = user.id

    try {
        const participant = await finishContestForUser(contestId, userId)

        return Response.json({
            success: true,
            message: 'Contest participation finished.',
            data: participant,
        })
    } catch (error) {
        console.error('[API] Failed to finish contest:', error)
        return Response.json(
            {
                success: false,
                message: error.message || 'Internal Server Error',
            },
            { status: error.status || 500 }
        )
    }
})
