import dbConnect from '@/lib/mongodb'
import { protect } from '@/middlewares/auth.middleware'
import { asyncHandler } from '@/lib/asyncHandler'
import { User } from '@/models/User.models'

export const GET = asyncHandler(async (req, { params }) => {
    await dbConnect()
    const resolvedParams = await params
    const user = await protect(req)

    const targetUser = await User.findById(resolvedParams.id).select('privacySettings')

    if (!targetUser) {
        return Response.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    return Response.json({ success: true, data: targetUser.privacySettings })
})

export const PUT = asyncHandler(async (req, { params }) => {
    await dbConnect()
    const resolvedParams = await params
    const user = await protect(req)

    const userId = user.id || user._id
    if (userId.toString() !== resolvedParams.id && user.role !== 'admin') {
        return Response.json({ success: false, message: 'Not authorized' }, { status: 403 })
    }

    const body = await req.json()

    // Fetch current settings to merge
    const currentUser = await User.findById(resolvedParams.id).select('privacySettings')
    if (!currentUser) {
        return Response.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const current = currentUser.privacySettings || {}

    // Build merged settings
    const merged = {
        profileVisibility: ['public', 'followers', 'private'].includes(body.profileVisibility)
            ? body.profileVisibility
            : current.profileVisibility || 'public',
        showStats:
            typeof body.showStats === 'boolean' ? body.showStats : (current.showStats ?? true),
        showSubmissions:
            typeof body.showSubmissions === 'boolean'
                ? body.showSubmissions
                : (current.showSubmissions ?? true),
        showContestHistory:
            typeof body.showContestHistory === 'boolean'
                ? body.showContestHistory
                : (current.showContestHistory ?? true),
        showFollowers:
            typeof body.showFollowers === 'boolean'
                ? body.showFollowers
                : (current.showFollowers ?? true),
    }

    const updatedUser = await User.findByIdAndUpdate(
        resolvedParams.id,
        { $set: { privacySettings: merged } },
        { new: true, runValidators: true }
    ).select('privacySettings')

    return Response.json({ success: true, data: updatedUser.privacySettings })
})
