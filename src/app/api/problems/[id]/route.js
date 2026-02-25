export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { fetchProblemById, update, remove } from '@/controllers/problem.controller'
import { asyncHandler } from '@/lib/asyncHandler'
import { authorize } from '@/middlewares/role.middleware'
import mongoose from 'mongoose'
import { protect } from '@/middlewares/auth.middleware'

export const GET = asyncHandler(async (req, context) => {
    const { id } = context.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('Invalid problem ID.')
        error.status = 400
        throw error
    }

    await dbConnect()
    return fetchProblemById(req, context)
})

export const PUT = asyncHandler(async (req, context) => {
    await dbConnect()

    const user = await protect(req)
    req.user = user

    await authorize(['admin'])(req, context)
    return update(req, context)
})

export const DELETE = asyncHandler(async (req, context) => {
    await dbConnect()

    const user = await protect(req)
    req.user = user

    await authorize(['admin'])(req, context)
    return remove(req, context)
})
