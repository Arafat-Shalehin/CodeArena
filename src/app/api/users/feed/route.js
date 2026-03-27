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

        // 1. Authenticate user
        const user = await protect(req)
        if (!user || (!user.following && !user.followers)) {
            // Need the full user document with 'following' array populated
            const fullUser = await User.findById(user._id).select('following').lean()
            user.following = fullUser?.following || []
        }

        // We also want to see our own posts in the feed
        const feedIds = [...(user.following || []), user._id]

        // 2. Fetch recent successful submissions from followed users + self
        const recentSubmissionsPromise = Submission.find({
            userId: { $in: feedIds },
            verdict: { $in: ['accepted', 'ACCEPTED'] },
        })
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
        const recentPostsPromise = Post.find({
            userId: { $in: feedIds },
        })
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
                hasLiked: (sub.likes || []).some(
                    (id) => id && id.toString() === user._id.toString()
                ),
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
