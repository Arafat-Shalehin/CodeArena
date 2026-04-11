export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { submitCode, fetchSubmissions } from '@/controllers/submission.controller'
import { asyncHandler } from '@/lib/asyncHandler'
import { protect } from '@/middlewares/auth.middleware'
import { submissionRateLimitMiddleware } from '@/middlewares/rateLimiter.middleware'

export const POST = asyncHandler(async (req) => {
    await dbConnect()

    const user = await protect(req)

    // Apply rate limiting (prevent spam submissions)
    const rateLimitResponse = await submissionRateLimitMiddleware(req, user._id.toString())
    if (rateLimitResponse) return rateLimitResponse

    return submitCode(req, user)
})

export const GET = asyncHandler(async (req) => {
    await dbConnect()

    const user = await protect(req)

    return fetchSubmissions(req, user)
})
