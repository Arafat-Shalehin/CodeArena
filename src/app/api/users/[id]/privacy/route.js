import dbConnect from '@/lib/mongodb'
import { protect } from '@/middlewares/auth.middleware'
import { asyncHandler } from '@/lib/asyncHandler'
import { User } from '@/models/User.models'

export const GET = asyncHandler(async (req, { params }) => {
    await dbConnect()
    const user = await protect(req)

    const targetUser = await User.findById(params.id).select('privacySettings')

    if (!targetUser) {
        return Response.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    return Response.json({ success: true, data: targetUser.privacySettings })
})

export const PUT = asyncHandler(async (req, { params }) => {
    await dbConnect()
    const user = await protect(req)

    if (user.id !== params.id && user.role !== 'admin') {
        return Response.json({ success: false, message: 'Not authorized' }, { status: 403 })
    }

    const body = await req.json()
    const allowedFields = [
        'profileVisibility',
        'showStats',
        'showSubmissions',
        'showContestHistory',
        'showFollowers',
        'allowMessaging',
        'indexProfile',
    ]
    const privacySettings = {}

    for (const field of allowedFields) {
        if (body[field] !== undefined) {
            privacySettings[field] = body[field]
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        params.id,
        { $set: { privacySettings } },
        { new: true }
    ).select('privacySettings')

    return Response.json({ success: true, data: updatedUser.privacySettings })
})
