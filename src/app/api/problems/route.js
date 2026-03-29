import dbConnect from '@/lib/mongodb'
import { fetchProblems, create } from '@/controllers/problem.controller'
import { asyncHandler } from '@/lib/asyncHandler'
import { authorize } from '@/middlewares/role.middleware'
import { protect } from '@/middlewares/auth.middleware'

export const dynamic = 'force-dynamic'

export const GET = asyncHandler(async (req) => {
    await dbConnect()

    // Optional protection: if status filter is used, we need the user
    try {
        const user = await protect(req)
        if (user) req.user = user
    } catch (e) {
        // Ignore if not logged in (status filter won't work but other filters will)
    }

    return fetchProblems(req)
})

export const POST = asyncHandler(async (req) => {
    await dbConnect()
    const user = await protect(req)
    req.user = user

    await authorize(['admin'])(req)
    return create(req)
})
