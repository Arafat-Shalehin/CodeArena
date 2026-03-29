export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { getParticipants } from '@/controllers/contestParticipant.controller'
import { asyncHandler } from '@/lib/asyncHandler'

export const GET = asyncHandler(async (req, context) => {
    await dbConnect()
    // Public endpoint - leaderboard is visible to all
    return getParticipants(req, context)
})
