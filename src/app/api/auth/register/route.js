export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { createUser } from '@/controllers/user.controller'
import { asyncHandler } from '@/lib/asyncHandler'
import { authRateLimitMiddleware } from '@/middlewares/rateLimiter.middleware'

/**
 * POST /api/auth/register
 * Public — creates user and auto-logs-in via httpOnly cookie
 * Rate limit: 5 attempts per minute per IP
 */
export const POST = asyncHandler(async (req) => {
    // Apply rate limiting first (prevents spam account creation)
    const rateLimitResponse = await authRateLimitMiddleware(req)
    if (rateLimitResponse) return rateLimitResponse

    await dbConnect()
    return createUser(req)
})
