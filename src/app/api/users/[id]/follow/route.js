export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { handleToggleFollow } from '@/controllers/user.controller'
import { asyncHandler } from '@/lib/asyncHandler'
import { protect } from '@/middlewares/auth.middleware'

export const POST = asyncHandler(async (req, context) => {
    await dbConnect()

    // Protect the route - only logged-in users can follow/unfollow
    const user = await protect(req)
    req.user = user

    return handleToggleFollow(req, context)
})
