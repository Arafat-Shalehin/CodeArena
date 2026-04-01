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

        // Try to get cached sidebar data (use generic cache for all users)
        const cacheKey = 'sidebar:generic'
        if (redisClient.isOpen) {
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

        // 1. Authenticate user to filter out themselves and followed users from suggestions.
        // If token is missing/invalid, continue as anonymous instead of failing the entire sidebar API.
        let user = null
        try {
            user = await protect(req)
        } catch (authError) {
            if (authError?.status !== 401) {
                throw authError
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
        // Users the current user does NOT follow, excluding themselves.
        const excludeFilter = user ? { _id: { $nin: [...followingIds, user._id] } } : {}
        const suggestedUsers = await User.aggregate([
            { $match: excludeFilter },
            { $sample: { size: 3 } }, // Randomly sample active users
            { $project: { name: 1, avatarSeed: 1, bio: 1, 'stats.globalRank': 1, country: 1 } },
        ])

        // 4. Fetch Upcoming Contests - add index on status + startTime
        const upcomingContests = await Contest.find({ status: 'upcoming' })
            .sort({ startTime: 1 })
            .limit(2)
            .select('title startTime maxParticipants')
            .lean()

        // 5. Fetch Top Contributors - using index on stats.score
        const topContributors = await User.find()
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

        // Cache the result for 5 minutes
        if (redisClient.isOpen) {
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
