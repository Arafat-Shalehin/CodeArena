export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { login } from '@/controllers/user.controller'
import { asyncHandler } from '@/lib/asyncHandler'
import { authRateLimitMiddleware } from '@/middlewares/rateLimiter.middleware'

/**
 * POST /api/auth/login
 * Public — authenticates user and sets httpOnly cookie
 * Rate limit: 5 attempts per minute per IP
 */
export const POST = asyncHandler(async (req) => {
    // Apply rate limiting first (blocks brute-force attacks)
    const rateLimitResponse = await authRateLimitMiddleware(req)
    if (rateLimitResponse) return rateLimitResponse

    await dbConnect()
    return login(req)
})
