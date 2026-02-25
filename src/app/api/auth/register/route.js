export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { createUser } from '@/controllers/user.controller'
import { asyncHandler } from '@/lib/asyncHandler'

/**
 * POST /api/auth/register
 * Public — creates user and auto-logs-in via httpOnly cookie
 */
export const POST = asyncHandler(async (req) => {
    await dbConnect()
    return createUser(req)
})
