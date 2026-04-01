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

    // Get the current user's following list to check isFollowing status
    const currentUserId = searchParams.get('currentUserId')
    let currentUserFollowing = []
    if (currentUserId) {
        const currentUser = await User.findById(currentUserId).select('following')
        currentUserFollowing = currentUser?.following?.map((fId) => fId.toString()) || []
    }

    if (type === 'followers' || type === 'all') {
        const followers = await User.find({ _id: { $in: user.followers } })
            .select(selectFields)
            .limit(limit)
            .lean()

        // Attach isFollowing status
        const followersWithStatus = followers.map((f) => ({
            ...f,
            isFollowing: currentUserFollowing.includes(f._id.toString()),
        }))

        responseData.followers = followersWithStatus
        responseData.followersCount = user.followers.length
    }

    if (type === 'following' || type === 'all') {
        const following = await User.find({ _id: { $in: user.following } })
            .select(selectFields)
            .limit(limit)
            .lean()

        // Attach isFollowing status
        const followingWithStatus = following.map((f) => ({
            ...f,
            isFollowing: currentUserFollowing.includes(f._id.toString()),
        }))

        responseData.following = followingWithStatus
        responseData.followingCount = user.following.length
    }

    return Response.json({
        success: true,
        data: responseData,
    })
})
