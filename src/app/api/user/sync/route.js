import dbConnect from '@/lib/mongodb'
import { syncUserStats } from '@/services/user.service'
import { protect } from '@/middlewares/auth.middleware'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/user/sync
 * Manually triggers a synchronization of user statistics from their submission history.
 */
export async function POST(request) {
    try {
        await dbConnect()

        const user = await protect(request)
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const updatedUser = await syncUserStats(user._id)

        return NextResponse.json({
            success: true,
            message: 'User statistics synchronized successfully.',
            data: updatedUser.stats,
        })
    } catch (error) {
        console.error('[UserSyncAPI] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to synchronize user statistics' },
            { status: 500 }
        )
    }
}
