import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'
import { Problem } from '@/models/Problem.models'
import { Contest } from '@/models/Contest.models'
import { protect } from '@/middlewares/auth.middleware'
import { redisClient } from '@/lib/redis'

// Cache sidebar data for 5 minutes to reduce database load
const SIDEBAR_CACHE_TTL = 300

export async function GET(req) {
    try {
        await dbConnect()

        // 1. Authenticate user to filter out themselves and followed users from suggestions.
        let user = null
        try {
            user = await protect(req)
        } catch (authError) {
            if (authError?.status !== 401) {
                throw authError
            }
        }

        // 2. Build user-specific cache key
        const cacheKey = user?._id ? `sidebar:user:${user._id}` : 'sidebar:anonymous'

        // Try to get cached sidebar data
        if (redisClient.isOpen && user?._id) {
            try {
                const cached = await redisClient.get(cacheKey)
                if (cached) {
                    return NextResponse.json({
                        success: true,
                        source: 'cache',
                        data: JSON.parse(cached),
                    })
                }
            } catch (cacheErr) {
                console.warn('[SidebarAPI] Cache get error:', cacheErr.message)
            }
        }

        let followingIds = []
        if (user) {
            if (!user.following) {
                const fullUser = await User.findById(user._id).select('following').lean()
                followingIds = fullUser?.following || []
            } else {
                followingIds = user.following
            }
        }

        // 2. Fetch Trending Problems - using index on totalSubmissions
        const trendingProblems = await Problem.find()
            .sort({ totalSubmissions: -1 })
            .limit(3)
            .select('title difficulty totalSubmissions')
            .lean()

        // 3. Fetch Suggested Users
        // Algorithm: Like Instagram "People You May Know"
        // - Exclude self and followed users
        // - Score based on: globalRank (better rank = higher score), more problems solved
        // - Filter out inactive users (must have solved at least 1 problem)
        // - Exclude users with no score
        const suggestedUsersExclude = user
            ? { _id: { $nin: [...followingIds, user._id] }, 'stats.score': { $gt: 0 } }
            : { 'stats.score': { $gt: 0 } }

        const suggestedUsers = await User.aggregate([
            { $match: suggestedUsersExclude },
            {
                $addFields: {
                    suggestionScore: {
                        $add: [
                            { $multiply: [{ $ifNull: ['$stats.score', 0] }, 0.3] },
                            { $multiply: [{ $ifNull: ['$stats.accepted', 0] }, 0.3] },
                            {
                                $cond: [
                                    { $eq: ['$stats.globalRank', 1] },
                                    100,
                                    { $cond: [{ $lt: ['$stats.globalRank', 100] }, 50, 10] },
                                ],
                            },
                        ],
                    },
                },
            },
            { $sort: { suggestionScore: -1 } },
            { $limit: 5 },
            {
                $project: {
                    name: 1,
                    avatarSeed: 1,
                    bio: 1,
                    'stats.globalRank': 1,
                    'stats.accepted': 1,
                    country: 1,
                },
            },
        ])

        // 4. Fetch Upcoming Contests - add index on status + startTime
        const upcomingContests = await Contest.find({ status: 'upcoming' })
            .sort({ startTime: 1 })
            .limit(2)
            .select('title startTime maxParticipants')
            .lean()

        // 5. Fetch Top Contributors - excluding current user
        const topContributorsQuery = user ? { _id: { $ne: user._id } } : {}
        const topContributors = await User.find(topContributorsQuery)
            .sort({ 'stats.score': -1 })
            .limit(3)
            .select('name avatarSeed stats.score')
            .lean()

        const sidebarData = {
            trendingProblems,
            suggestedUsers,
            upcomingContests,
            topContributors,
        }

        // Cache user-specific data for 5 minutes (skip for anonymous)
        if (redisClient.isOpen && user?._id) {
            try {
                await redisClient.setEx(cacheKey, SIDEBAR_CACHE_TTL, JSON.stringify(sidebarData))
            } catch (cacheErr) {
                console.warn('[SidebarAPI] Cache set error:', cacheErr.message)
            }
        }

        return NextResponse.json({ success: true, source: 'fresh', data: sidebarData })
    } catch (error) {
        console.error('Sidebar Data Error:', error)
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 })
    }
}
