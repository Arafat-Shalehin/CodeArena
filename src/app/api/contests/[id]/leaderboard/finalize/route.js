export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { asyncHandler } from '@/lib/asyncHandler'
import { protect } from '@/middlewares/auth.middleware'
import { authorize } from '@/middlewares/role.middleware'
import { finalizeLeaderboard } from '@/controllers/leaderboard.controller'

export const POST = asyncHandler(async (req, context) => {
    await dbConnect()

    const user = await protect(req)
    req.user = user

    await authorize(['admin'])(req)

    return finalizeLeaderboard(req, context)
})
