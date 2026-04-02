import dbConnect from '@/lib/mongodb'
import { protect } from '@/middlewares/auth.middleware'
import { asyncHandler } from '@/lib/asyncHandler'
import { User } from '@/models/User.models'

export const POST = asyncHandler(async (req, { params }) => {
    await dbConnect()
    const resolvedParams = await params
    const user = await protect(req)

    const userId = user.id || user._id
    if (userId.toString() !== resolvedParams.id && user.role !== 'admin') {
        return Response.json({ success: false, message: 'Not authorized' }, { status: 403 })
    }

    const body = await req.json()
    const { currentPassword, newPassword, isFirstTimePassword } = body

    if (!newPassword) {
        return Response.json(
            { success: false, message: 'New password is required' },
            { status: 400 }
        )
    }

    if (newPassword.length < 6) {
        return Response.json(
            { success: false, message: 'Password must be at least 6 characters' },
            { status: 400 }
        )
    }

    const dbUser = await User.findById(resolvedParams.id).select('+password')

    if (!dbUser) {
        return Response.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // If user already has a password, verify current password
    if (dbUser.password) {
        if (!currentPassword) {
            return Response.json(
                { success: false, message: 'Current password is required' },
                { status: 400 }
            )
        }

        const isMatch = await dbUser.comparePassword(currentPassword)
        if (!isMatch) {
            return Response.json(
                { success: false, message: 'Current password is incorrect' },
                { status: 400 }
            )
        }
    }

    // Update password
    dbUser.password = newPassword
    dbUser.authProvider = 'local'
    await dbUser.save()

    return Response.json({
        success: true,
        message: isFirstTimePassword
            ? 'Password set successfully'
            : 'Password changed successfully',
    })
})
