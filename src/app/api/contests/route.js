export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { fetchContests, create } from '@/controllers/contest.controller'
import { asyncHandler } from '@/lib/asyncHandler'
import { authorize } from '@/middlewares/role.middleware'
import { protect } from '@/middlewares/auth.middleware'

export const GET = asyncHandler(async (req, context) => {
    await dbConnect()

    // context.user may exist if authentication middleware is used
    return fetchContests(req, context)
})

export const POST = asyncHandler(async (req, context) => {
    await dbConnect()

    const user = await protect(req)
    req.user = user

    await authorize(['admin'])(req)

    // Only admin can create contests
    await authorize(['admin'])(req, context)

    return create(req, context)
})
