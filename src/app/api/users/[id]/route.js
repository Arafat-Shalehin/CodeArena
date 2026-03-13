export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { fetchUserById, removeUser, updateUserDetails } from '@/controllers/user.controller'
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

export const PUT = asyncHandler(async (req, context) => {
    await dbConnect()

    // Protect the route - only logged-in users can update profiles
    const user = await protect(req)
    req.user = user

    return updateUserDetails(req, context)
})
