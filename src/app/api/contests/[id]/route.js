export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { fetchContestById, update, remove } from '@/controllers/contest.controller'
import { asyncHandler } from '@/lib/asyncHandler'
import { authorize } from '@/middlewares/role.middleware'

export const GET = asyncHandler(async (req, context) => {
    await dbConnect()

    const user = await authorize(['admin'])(req)

    // Pass isAdmin explicitly or inside context
    return fetchContestById(req, { ...context, isAdmin: true })
})
export const PATCH = asyncHandler(async (req, context) => {
    await dbConnect()
    // Admin অথোরাইজেশন নিশ্চিত করা
    // await authorize(['admin'])(req)
    return update(req, context)
})

export const PUT = asyncHandler(async (req, context) => {
    await dbConnect()

    // Only admin can update
    // await authorize(['admin'])(req, context)

    return update(req, context)
})

export const DELETE = asyncHandler(async (req, context) => {
    await dbConnect()

    // Only admin can delete (soft delete)
    // await authorize(['admin'])(req, context)

    return remove(req, context)
})
