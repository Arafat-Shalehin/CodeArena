import dbConnect from '@/lib/mongodb'
import { protect } from '@/middlewares/auth.middleware'
import { asyncHandler } from '@/lib/asyncHandler'
import { User } from '@/models/User.models'

export const POST = asyncHandler(async (req) => {
    await dbConnect()

    let user
    try {
        user = await protect(req)
    } catch {
        return Response.json(
            { success: false, message: 'Authentication required' },
            { status: 401 }
        )
    }

    const body = await req.json()
    const { endpoint, keys } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return Response.json(
            { success: false, message: 'Invalid subscription data' },
            { status: 400 }
        )
    }

    const userId = user.id || user._id

    // Remove existing subscription with same endpoint if any
    await User.findByIdAndUpdate(userId, {
        $pull: { pushSubscriptions: { endpoint } },
    })

    // Add new subscription
    await User.findByIdAndUpdate(userId, {
        $push: {
            pushSubscriptions: {
                endpoint,
                keys: { p256dh: keys.p256dh, auth: keys.auth },
            },
        },
    })

    return Response.json({ success: true, message: 'Push subscription saved' })
})
