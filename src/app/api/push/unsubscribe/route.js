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
    const { endpoint } = body

    if (!endpoint) {
        return Response.json({ success: false, message: 'Endpoint is required' }, { status: 400 })
    }

    const userId = user.id || user._id

    await User.findByIdAndUpdate(userId, {
        $pull: { pushSubscriptions: { endpoint } },
    })

    return Response.json({ success: true, message: 'Push subscription removed' })
})
