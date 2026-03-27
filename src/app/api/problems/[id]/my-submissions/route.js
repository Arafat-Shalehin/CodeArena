export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { fetchSubmissions } from '@/controllers/submission.controller'
import { asyncHandler } from '@/lib/asyncHandler'
import { protect } from '@/middlewares/auth.middleware'

/**
 * GET /api/problems/[id]/my-submissions
 */
export const GET = asyncHandler(async (req, context) => {
    await dbConnect()
    const user = await protect(req)

    const { id } = await context.params

    // Add problemId and userId to the URL so the controller picks them up
    const url = new URL(req.url)
    url.searchParams.set('problemId', id)
    url.searchParams.set('userId', user.id)

    const modifiedReq = {
        ...req,
        url: url.toString(),
    }

    return fetchSubmissions(modifiedReq, user)
})
