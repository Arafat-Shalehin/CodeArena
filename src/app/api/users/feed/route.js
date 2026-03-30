import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Submission } from '@/models/Submission.models'
import { User } from '@/models/User.models'
import { protect } from '@/middlewares/auth.middleware'
import { Problem } from '@/models/Problem.models'
import { Post } from '@/models/Post.models'

export const dynamic = 'force-dynamic'

/**
 * GET /api/users/feed
 * Returns a merged, chronologically sorted feed of accepted submissions + posts
 * from followed users + self.
 *
 * Query params:
 *   ?cursor=<ISO date string>  — fetch items older than this date
 *   ?limit=<number>            — items per page (default 15, max 30)
 */
export async function GET(req) {
    try {
        await dbConnect()

        const { searchParams } = new URL(req.url)
        const cursor = searchParams.get('cursor')
        const limit = Math.min(parseInt(searchParams.get('limit') || '15', 10), 30)

        // 1. Authenticate user
        const user = await protect(req)
        if (!user || (!user.following && !user.followers)) {
            const fullUser = await User.findById(user._id).select('following').lean()
            user.following = fullUser?.following || []
        }

        const feedIds = [...(user.following || []), user._id]

        // Build date filter for cursor-based pagination
        const dateFilter = cursor ? { createdAt: { $lt: new Date(cursor) } } : {}

        // 2. Fetch submissions (extra 1 for hasMore detection)
        const recentSubmissionsPromise = Submission.find({
            userId: { $in: feedIds },
            verdict: { $in: ['accepted', 'ACCEPTED'] },
            ...dateFilter,
        })
            .sort({ createdAt: -1 })
            .limit(limit + 1)
            .populate({ path: 'userId', select: 'name avatarSeed' })
            .populate({ path: 'problemId', select: 'title difficulty' })
            .lean()

        // 3. Fetch posts
        const recentPostsPromise = Post.find({
            userId: { $in: feedIds },
            ...dateFilter,
        })
            .sort({ createdAt: -1 })
            .limit(limit + 1)
            .populate({ path: 'userId', select: 'name avatarSeed' })
            .lean()

        const [recentSubmissions, recentPosts] = await Promise.all([
            recentSubmissionsPromise,
            recentPostsPromise,
        ])

        // 4. Format items
        const formattedSubmissions = recentSubmissions
            .filter((sub) => sub.userId && sub.problemId)
            .map((sub) => ({
                id: sub._id,
                _id: sub._id,
                type: 'submission',
                user: {
                    _id: sub.userId._id,
                    name: sub.userId.name,
                    avatarSeed: sub.userId.avatarSeed,
                },
                problem: {
                    _id: sub.problemId._id,
                    title: sub.problemId.title,
                    difficulty: sub.problemId.difficulty,
                },
                language: sub.language || 'javascript',
                executionTime: sub.executionTime,
                memoryUsed: sub.memoryUsed,
                likes: sub.likes?.length || 0,
                hasLiked: (sub.likes || []).some(
                    (id) => id && id.toString() === user._id.toString()
                ),
                commentCount: sub.comments?.length || 0,
                createdAt: sub.createdAt,
            }))

        const formattedPosts = recentPosts.map((post) => ({
            id: post._id,
            _id: post._id,
            type: 'post',
            user: {
                _id: post.userId._id,
                name: post.userId.name,
                avatarSeed: post.userId.avatarSeed,
            },
            content: post.content,
            likes: post.likes?.length || 0,
            hasLiked: (post.likes || []).some((id) => id && id.toString() === user._id.toString()),
            commentCount: post.comments?.length || 0,
            createdAt: post.createdAt,
        }))

        // 5. Merge, sort, slice
        const allItems = [...formattedSubmissions, ...formattedPosts].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )

        const hasMore = allItems.length > limit
        const feed = allItems.slice(0, limit)
        const nextCursor = feed.length > 0 ? feed[feed.length - 1].createdAt : null

        return NextResponse.json({
            success: true,
            data: feed,
            pagination: {
                hasMore,
                nextCursor,
                count: feed.length,
            },
        })
    } catch (error) {
        console.error('Feed error:', error)
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 })
    }
}
