import dbConnect from '@/lib/mongodb'
import { protect } from '@/middlewares/auth.middleware'
import { asyncHandler } from '@/lib/asyncHandler'
import { User } from '@/models/User.models'

export const GET = asyncHandler(async (req, { params }) => {
    await dbConnect()
    const user = await protect(req)

    const targetUser = await User.findById(params.id).select('preferences')

    if (!targetUser) {
        return Response.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    return Response.json({ success: true, data: targetUser.preferences })
})

export const PUT = asyncHandler(async (req, { params }) => {
    await dbConnect()
    const user = await protect(req)

    if (user.id !== params.id && user.role !== 'admin') {
        return Response.json({ success: false, message: 'Not authorized' }, { status: 403 })
    }

    const body = await req.json()
    const allowedFields = ['language', 'timezone', 'theme', 'weeklyGoal']
    const preferences = {}

    for (const field of allowedFields) {
        if (body[field] !== undefined) {
            preferences[field] = body[field]
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        params.id,
        { $set: { preferences } },
        { new: true }
    ).select('preferences')

    return Response.json({ success: true, data: updatedUser.preferences })
})
