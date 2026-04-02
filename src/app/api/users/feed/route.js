import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Submission } from '@/models/Submission.models'
import { User } from '@/models/User.models'
import { protect } from '@/middlewares/auth.middleware'
import { Problem } from '@/models/Problem.models'

import { Post } from '@/models/Post.models'

export const dynamic = 'force-dynamic'

export async function GET(req) {
    try {
        await dbConnect()

        // 1. Authenticate user when possible.
        // If token is invalid/missing, continue as a public feed instead of failing hard.
        let user = null
        try {
            user = await protect(req)
        } catch (authError) {
            if (authError?.status !== 401) {
                throw authError
            }
        }

        let followingIds = []
        if (user?._id) {
            const fullUser = await User.findById(user._id).select('following').lean()
            followingIds = fullUser?.following || []
        }

        // Authenticated: followed users + self.
        // Anonymous/new session: fall back to global recent activity.
        const feedIds = user?._id ? [...followingIds, user._id] : null

        // 2. Fetch recent successful submissions from followed users + self
        const recentSubmissionsQuery = {
            verdict: { $in: ['accepted', 'ACCEPTED'] },
        }
        if (feedIds) {
            recentSubmissionsQuery.userId = { $in: feedIds }
        }

        const recentSubmissionsPromise = Submission.find(recentSubmissionsQuery)
            .sort({ createdAt: -1 })
            .limit(20)
            .populate({
                path: 'userId',
                select: 'name avatarSeed',
            })
            .populate({
                path: 'problemId',
                select: 'title difficulty',
            })
            .lean()

        // 3. Fetch recent posts from followed users + self
        const recentPostsQuery = feedIds ? { userId: { $in: feedIds } } : {}

        const recentPostsPromise = Post.find(recentPostsQuery)
            .sort({ createdAt: -1 })
            .limit(10)
            .populate({
                path: 'userId',
                select: 'name avatarSeed',
            })
            .lean()

        const [recentSubmissions, recentPosts] = await Promise.all([
            recentSubmissionsPromise,
            recentPostsPromise,
        ])

        // 4. Format and merge items
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
                commentCount: sub.comments?.length || 0,
                hasLiked: user?._id
                    ? (sub.likes || []).some((id) => id && id.toString() === user._id.toString())
                    : false,
                createdAt: sub.createdAt,
            }))

        const formattedPosts = recentPosts
            .filter((post) => post.userId)
            .map((post) => ({
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
                commentCount: post.comments?.length || 0,
                hasLiked: user?._id
                    ? (post.likes || []).some((id) => id && id.toString() === user._id.toString())
                    : false,
                createdAt: post.createdAt,
            }))

        const feed = [...formattedSubmissions, formattedPosts]
            .flat()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 30)

        return NextResponse.json({ success: true, data: feed })
    } catch (error) {
        console.error('Feed error:', error)
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 })
    }
}
