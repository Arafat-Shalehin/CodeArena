export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { fetchUserById, removeUser } from '@/controllers/user.controller'
import { asyncHandler } from '@/lib/asyncHandler'
import { authorize } from '@/middlewares/role.middleware'
import { protect } from '@/middlewares/auth.middleware'

export const GET = asyncHandler(async (req, context) => {
    await dbConnect()
    return fetchUserById(req, context)
})

export const DELETE = asyncHandler(async (req, context) => {
    await dbConnect()

    const user = await protect(req)
    req.user = user

    await authorize(['admin'])(req)
    return removeUser(req, context)
})
