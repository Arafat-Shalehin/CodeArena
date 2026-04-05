export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { fetchContestById, update, remove } from '@/controllers/contest.controller'
import { asyncHandler } from '@/lib/asyncHandler'
import { authorize } from '@/middlewares/role.middleware'
import { protect } from '@/middlewares/auth.middleware'

export const GET = asyncHandler(async (req, context) => {
    await dbConnect()
    const user = await protect(req)
    req.user = user
    await authorize(['admin'])(req)
    return fetchContestById(req, { ...context, isAdmin: true })
})
export const PATCH = asyncHandler(async (req, context) => {
    await dbConnect()
    const user = await protect(req)
    req.user = user
    await authorize(['admin'])(req)
    return update(req, context)
})

export const PUT = asyncHandler(async (req, context) => {
    await dbConnect()
    const user = await protect(req)
    req.user = user
    await authorize(['admin'])(req)
    return update(req, context)
})

export const DELETE = asyncHandler(async (req, context) => {
    await dbConnect()
    const user = await protect(req)
    req.user = user
    await authorize(['admin'])(req)
    return remove(req, context)
})
