import dbConnect from '@/lib/mongodb'
import { asyncHandler } from '@/lib/asyncHandler'
import { protect } from '@/middlewares/auth.middleware'
import { fetchMyRank } from '@/controllers/leaderboard.controller'

export const GET = asyncHandler(async (req, context) => {
    await dbConnect()

    const user = await protect(req)
    req.user = user

    return fetchMyRank(req, context)
})
