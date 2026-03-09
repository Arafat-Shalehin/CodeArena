import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Submission } from '@/models/Submission.models'
import { User } from '@/models/User.models'
import { protect } from '@/middlewares/auth.middleware'
import { Problem } from '@/models/Problem.models'

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

        const followingIds = user.following || []

        if (followingIds.length === 0) {
            return NextResponse.json({ success: true, data: [] })
        }

        // 2. Fetch recent successful submissions from followed users
        // Limit to the last 20 recent success submissions
        const recentSubmissions = await Submission.find({
            userId: { $in: followingIds },
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

        // 3. Format feed items
        const feed = recentSubmissions
            .filter((sub) => sub.userId && sub.problemId) // Filter out any broken references
            .map((sub) => ({
                id: sub._id,
                _id: sub._id,
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

        return NextResponse.json({ success: true, data: feed })
    } catch (error) {
        console.error('Feed error:', error)
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 })
    }
}
