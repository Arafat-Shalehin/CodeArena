import dbConnect from '@/lib/mongodb'
import { checkRegistration } from '@/controllers/contestParticipant.controller'
import { asyncHandler } from '@/lib/asyncHandler'
import { protect } from '@/middlewares/auth.middleware'

export const GET = asyncHandler(async (req, context) => {
    // 1️⃣ Connect to database
    await dbConnect()

    // 2️⃣ Require authentication (only logged-in users can check their registration)
    const user = await protect(req)
    req.user = user

    // 3️⃣ Call controller
    return checkRegistration(req, context)
})
