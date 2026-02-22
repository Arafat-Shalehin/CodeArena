import dbConnect from '@/lib/mongodb'
import { submitCode, fetchSubmissions } from '@/controllers/submission.controller'
import { asyncHandler } from '@/lib/asyncHandler'
import { protect } from '@/middlewares/auth.middleware'

export const POST = asyncHandler(async (req) => {
    await dbConnect()

    const user = await protect(req)

    return submitCode(req, user)
})

export const GET = asyncHandler(async (req) => {
    await dbConnect()

    const user = await protect(req)

    return fetchSubmissions(req, user)
})
