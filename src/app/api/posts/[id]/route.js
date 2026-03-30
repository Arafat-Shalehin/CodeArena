import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Post } from '@/models/Post.models'
import { protect } from '@/middlewares/auth.middleware'

export const dynamic = 'force-dynamic'

export async function GET(req, { params }) {
    try {
        await dbConnect()

        const user = await protect(req)
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const post = await Post.findById(id).populate({ path: 'userId', select: 'name avatarSeed' })

        if (!post || !post.userId) {
            return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: {
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
                hasLiked: (post.likes || []).some((likeId) => likeId?.toString() === user._id.toString()),
                commentCount: post.comments?.length || 0,
                createdAt: post.createdAt,
            },
        })
    } catch (error) {
        console.error('Get post detail error:', error)
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 })
    }
}
