export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { fetchProblemById, update, remove } from '@/controllers/problem.controller'
import { asyncHandler } from '@/lib/asyncHandler'
import { authorize } from '@/middlewares/role.middleware'
import mongoose from 'mongoose'
import { protect } from '@/middlewares/auth.middleware'

export const GET = asyncHandler(async (req, context) => {
    const params = await context.params
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('Invalid problem ID.')
        error.status = 400
        throw error
    }

    await dbConnect()
    return fetchProblemById(req, { params })
})

export const PUT = asyncHandler(async (req, context) => {
    const params = await context.params
    await dbConnect()

    const user = await protect(req)
    req.user = user

    await authorize(['admin'])(req, { params })
    return update(req, { params })
})

export const DELETE = asyncHandler(async (req, context) => {
    const params = await context.params
    await dbConnect()

    const user = await protect(req)
    req.user = user

    await authorize(['admin'])(req, { params })
    return remove(req, { params })
})
