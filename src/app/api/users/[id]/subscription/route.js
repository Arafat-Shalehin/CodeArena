import dbConnect from '@/lib/mongodb'
import { protect } from '@/middlewares/auth.middleware'
import { asyncHandler } from '@/lib/asyncHandler'
import { User } from '@/models/User.models'

export const GET = asyncHandler(async (req, { params }) => {
    await dbConnect()
    const user = await protect(req)

    const targetUser = await User.findById(params.id).select('subscription')

    if (!targetUser) {
        return Response.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const subscription = targetUser.subscription || {
        plan: 'free',
        status: 'active',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
    }

    return Response.json({ success: true, data: subscription })
})

export const DELETE = asyncHandler(async (req, { params }) => {
    await dbConnect()
    const user = await protect(req)

    if (user.id !== params.id && user.role !== 'admin') {
        return Response.json({ success: false, message: 'Not authorized' }, { status: 403 })
    }

    // Mark subscription to cancel at period end
    const updatedUser = await User.findByIdAndUpdate(
        params.id,
        {
            $set: {
                'subscription.cancelAtPeriodEnd': true,
                'subscription.status': 'cancelling',
            },
        },
        { new: true }
    ).select('subscription')

    return Response.json({
        success: true,
        message: 'Subscription will be cancelled at the end of billing period',
        data: updatedUser.subscription,
    })
})
