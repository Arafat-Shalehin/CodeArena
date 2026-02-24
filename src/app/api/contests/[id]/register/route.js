export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { register } from '@/controllers/contestParticipant.controller'
import { asyncHandler } from '@/lib/asyncHandler'
import { protect } from '@/middlewares/auth.middleware'

export const POST = asyncHandler(async (req, context) => {
    await dbConnect()
    const user = await protect(req)
    return register(req, context, user)
})
