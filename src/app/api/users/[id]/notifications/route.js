import dbConnect from '@/lib/mongodb'
import { protect } from '@/middlewares/auth.middleware'
import { asyncHandler } from '@/lib/asyncHandler'
import { User } from '@/models/User.models'

export const GET = asyncHandler(async (req, { params }) => {
    await dbConnect()
    const user = await protect(req)
    const resolvedParams = await params

    const userId = user.id || user._id
    if (userId.toString() !== resolvedParams.id && user.role !== 'admin') {
        return Response.json({ success: false, message: 'Not authorized' }, { status: 403 })
    }

    const targetUser = await User.findById(resolvedParams.id).select('notificationSettings')

    if (!targetUser) {
        return Response.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    return Response.json({ success: true, data: targetUser.notificationSettings })
})

export const PUT = asyncHandler(async (req, { params }) => {
    await dbConnect()
    const user = await protect(req)
    const resolvedParams = await params

    const userId = user.id || user._id
    if (userId.toString() !== resolvedParams.id && user.role !== 'admin') {
        return Response.json({ success: false, message: 'Not authorized' }, { status: 403 })
    }

    const body = await req.json()
    const allowedFields = [
        'pushSubmissions',
        'pushContests',
        'pushFollowers',
        'notifyAchievements',
        'notifyComments',
    ]
    const safeData = {}

    for (const field of allowedFields) {
        if (body[field] !== undefined) {
            safeData[`notificationSettings.${field}`] =
                typeof body[field] === 'boolean' ? body[field] : false
        }
    }

    if (Object.keys(safeData).length === 0) {
        return Response.json(
            { success: false, message: 'No valid fields to update' },
            { status: 400 }
        )
    }

    const updatedUser = await User.findByIdAndUpdate(
        resolvedParams.id,
        { $set: safeData },
        { new: true }
    ).select('notificationSettings')

    return Response.json({ success: true, data: updatedUser.notificationSettings })
})
