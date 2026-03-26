import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'
import { protect } from '@/middlewares/auth.middleware'

/**
 * GET /api/users/check-username?username=xxx
 * Checks if a username is available (unique)
 */
export const GET = async (req) => {
    try {
        await dbConnect()

        // Protect the route - only logged-in users can check
        const user = await protect(req)
        req.user = user

        const { searchParams } = new URL(req.url)
        const username = searchParams.get('username')

        if (!username) {
            return Response.json(
                { success: false, message: 'Username is required' },
                { status: 400 }
            )
        }

        // Validate username format
        const usernameRegex = /^[a-zA-Z0-9_]{3,25}$/
        if (!usernameRegex.test(username)) {
            return Response.json(
                {
                    success: false,
                    message:
                        'Username must be 3-25 characters and contain only letters, numbers, and underscores',
                    available: false,
                },
                { status: 400 }
            )
        }

        // Check if username is taken by another user
        const existingUser = await User.findOne({ name: username })

        // If no user found, or the found user is the current user (editing their own name)
        const isAvailable = !existingUser || existingUser._id.toString() === user.id.toString()

        return Response.json({
            success: true,
            available: isAvailable,
            message: isAvailable ? 'Username is available' : 'Username is already taken',
        })
    } catch (error) {
        console.error('Username check error:', error)
        return Response.json(
            { success: false, message: 'Failed to check username', error: error.message },
            { status: 500 }
        )
    }
}
