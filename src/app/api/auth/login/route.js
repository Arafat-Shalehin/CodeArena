import dbConnect from '@/lib/mongodb'
import { login } from '@/controllers/user.controller'
import { asyncHandler } from '@/lib/asyncHandler'

/**
 * POST /api/auth/login
 * Public — authenticates user and sets httpOnly cookie
 */
export const POST = asyncHandler(async (req) => {
    await dbConnect()
    return login(req)
})
