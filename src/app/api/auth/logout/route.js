export const dynamic = 'force-dynamic'
import { logout } from '@/controllers/user.controller'
import { asyncHandler } from '@/lib/asyncHandler'

/**
 * POST /api/auth/logout
 * Authenticated — clears the httpOnly auth cookie
 */
export const POST = asyncHandler(async (req) => {
    // Always clear cookie, even if the current token is stale/invalid.
    return logout()
})
