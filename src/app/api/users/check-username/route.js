import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'
import { protect } from '@/middlewares/auth.middleware'

/**
 * GET /api/users/check-username?username=xxx
 *
 * Checks if a username is:
 *   (a) valid format
 *   (b) available (not taken by another user)
 *   (c) accessible — i.e., the current user is not in a 15-day cooldown period
 *
 * Returns:
 *   available: boolean
 *   canChange: boolean  (false when within 15-day cooldown)
 *   daysRemaining: number  (0 when not locked)
 */
export const GET = async (req) => {
    try {
        await dbConnect()

        const authUser = await protect(req)
        req.user = authUser

        const { searchParams } = new URL(req.url)
        const username = searchParams.get('username')

        if (!username) {
            return Response.json(
                { success: false, message: 'Username is required' },
                { status: 400 }
            )
        }

        // Validate format
        const usernameRegex = /^[a-zA-Z0-9_]{3,25}$/
        if (!usernameRegex.test(username)) {
            return Response.json(
                {
                    success: false,
                    available: false,
                    canChange: false,
                    daysRemaining: 0,
                    message:
                        'Username must be 3–25 characters and contain only letters, numbers, and underscores',
                },
                { status: 200 } // 200 so the client can render the message inline
            )
        }

        // Fetch current user's lastUsernameChange + current name
        const currentUser = await User.findById(authUser.id).select('name lastUsernameChange')

        // Compute cooldown
        let canChange = true
        let daysRemaining = 0

        if (currentUser?.lastUsernameChange) {
            const msSince = Date.now() - new Date(currentUser.lastUsernameChange).getTime()
            const daysSince = msSince / (1000 * 60 * 60 * 24)
            if (daysSince < 15) {
                canChange = false
                daysRemaining = Math.ceil(15 - daysSince)
            }
        }

        // If same as current name, it's "available" (no change needed)
        if (username.toLowerCase() === currentUser?.name?.toLowerCase()) {
            return Response.json({
                success: true,
                available: true,
                canChange,
                daysRemaining,
                message: canChange
                    ? 'This is your current username'
                    : `You cannot change your username for ${daysRemaining} more day${daysRemaining === 1 ? '' : 's'}`,
            })
        }

        // Check availability against other users
        const existing = await User.findOne({ name: username, _id: { $ne: authUser.id } }).select(
            '_id'
        )
        const available = !existing

        return Response.json({
            success: true,
            available,
            canChange,
            daysRemaining,
            message: !canChange
                ? `You cannot change your username for ${daysRemaining} more day${daysRemaining === 1 ? '' : 's'}`
                : available
                  ? 'Username is available! ✓'
                  : 'This username is already taken',
        })
    } catch (error) {
        console.error('Username check error:', error)
        return Response.json(
            { success: false, message: 'Failed to check username', error: error.message },
            { status: 500 }
        )
    }
}
