export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'
import { asyncHandler } from '@/lib/asyncHandler'

/**
 * GET /api/users/[id]/friends
 * Fetches the populated list of a user's followers and following.
 * Supports pagination and fetching specific types (followers or following).
 *
 * Query Params:
 * - type: 'followers' | 'following' | 'all' (default)
 * - limit: max number of users to return per type (default 50)
 */
export const GET = asyncHandler(async (req, context) => {
    await dbConnect()

    // Await params per Next.js 15+ convention for server methods
    const { id } = await context.params
    const searchParams = req.nextUrl.searchParams
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const user = await User.findById(id).select('followers following')

    if (!user) {
        return Response.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const responseData = {}
    const selectFields = '_id name bio avatarSeed stats.score stats.globalRank'

    if (type === 'followers' || type === 'all') {
        // Extract IDs from potentially complex array structure
        const followerIds = (user.followers || []).map((f) => (f._id ? f._id : f))
        const followers = await User.find({ _id: { $in: followerIds } })
            .select(selectFields)
            .limit(limit)
            .lean()
        responseData.followers = followers
        responseData.followersCount = followerIds.length
    }

    if (type === 'following' || type === 'all') {
        // Extract IDs from potentially complex array structure
        const followingIds = (user.following || []).map((f) => (f._id ? f._id : f))
        const following = await User.find({ _id: { $in: followingIds } })
            .select(selectFields)
            .limit(limit)
            .lean()
        responseData.following = following
        responseData.followingCount = followingIds.length
    }

    return Response.json({
        success: true,
        data: responseData,
    })
})
