import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'
import { Problem } from '@/models/Problem.models'
import { Contest } from '@/models/Contest.models'
import { protect } from '@/middlewares/auth.middleware'

export const dynamic = 'force-dynamic'

export async function GET(req) {
    try {
        await dbConnect()

        // 1. Authenticate user to filter out themselves and followed users from suggestions
        const user = await protect(req)
        let followingIds = []
        if (user) {
            if (!user.following) {
                const fullUser = await User.findById(user._id).select('following').lean()
                followingIds = fullUser?.following || []
            } else {
                followingIds = user.following
            }
        }

        // 2. Fetch Trending Problems
        // Problems with the highest total submissions
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
            { $project: { name: 1, avatarSeed: 1, bio: 1, 'stats.globalRank': 1 } },
        ])

        // 4. Fetch Upcoming Contests
        const upcomingContests = await Contest.find({ status: 'upcoming' })
            .sort({ startTime: 1 })
            .limit(2)
            .select('title startTime maxParticipants')
            .lean()

        // 5. Fetch Top Contributors
        // Top users globally by score
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

        return NextResponse.json({ success: true, data: sidebarData })
    } catch (error) {
        console.error('Sidebar Data Error:', error)
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 })
    }
}
