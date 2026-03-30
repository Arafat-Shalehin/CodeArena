import dbConnect from '@/lib/mongodb'
import { protect } from '@/middlewares/auth.middleware'
import { asyncHandler } from '@/lib/asyncHandler'
import { User } from '@/models/User.models'
import bcrypt from 'bcryptjs'

export const POST = asyncHandler(async (req, { params }) => {
    await dbConnect()
    const user = await protect(req)

    if (user.id !== params.id && user.role !== 'admin') {
        return Response.json({ success: false, message: 'Not authorized' }, { status: 403 })
    }

    const body = await req.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
        return Response.json(
            { success: false, message: 'Current and new password are required' },
            { status: 400 }
        )
    }

    // Get user with password
    const dbUser = await User.findById(params.id).select('+password')

    if (!dbUser) {
        return Response.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Check if user has a password (might be social login)
    if (!dbUser.password) {
        return Response.json(
            { success: false, message: 'Cannot change password for social login accounts' },
            { status: 400 }
        )
    }

    // Verify current password
    const isMatch = await dbUser.comparePassword(currentPassword)
    if (!isMatch) {
        return Response.json(
            { success: false, message: 'Current password is incorrect' },
            { status: 400 }
        )
    }

    // Update password
    dbUser.password = newPassword
    await dbUser.save()

    return Response.json({
        success: true,
        message: 'Password changed successfully',
    })
})
