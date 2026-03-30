import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Post } from '@/models/Post.models'
import { protect } from '@/middlewares/auth.middleware'
import { resolveNotificationActorName } from '@/services/notification.service'

/**
 * GET /api/posts/[id]/comments
 * Fetch comments for a post (populated with user info).
 */
export async function GET(req, { params }) {
    try {
        await dbConnect()
        const { id } = await params

        const post = await Post.findById(id)
            .select('comments')
            .populate({
                path: 'comments',
                populate: {
                    path: 'userId',
                    select: 'name avatarSeed',
                },
            })
            .lean()

        if (!post) {
            return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 })
        }

        const comments = (post.comments || [])
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 50)

        return NextResponse.json({ success: true, data: comments })
    } catch (error) {
        console.error('Get comments error:', error)
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 })
    }
}

/**
 * POST /api/posts/[id]/comments
 * Add a comment to a post.
 */
export async function POST(req, { params }) {
    try {
        await dbConnect()
        const { id } = await params

        const user = await protect(req)
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const { text } = await req.json()
        if (!text || text.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: 'Comment text is required' },
                { status: 400 }
            )
        }

        const post = await Post.findById(id)
        if (!post) {
            return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 })
        }

        // Create comment using Mongoose's subdocument creation
        const comment = post.comments.create({
            userId: user._id,
            text: text.trim(),
        })

        // Initialize comments array if it doesn't exist (for older posts)
        if (!post.comments) {
            post.comments = []
        }

        post.comments.push(comment)
        await post.save()

        // Populate the newly added comment's user info
        await post.populate({
            path: 'comments',
            populate: {
                path: 'userId',
                select: 'name avatarSeed',
            },
        })

        // Get the newly added comment with populated user info
        const newComment = post.comments[post.comments.length - 1].toObject()

        // Notify post owner if someone else commented
        if (post.userId.toString() !== user._id.toString()) {
            const { sendNotification } = await import('@/services/notification.service')
            const actorName = await resolveNotificationActorName(user)
            await sendNotification({
                recipientId: post.userId,
                senderId: user._id,
                type: 'social',
                message: `${actorName} commented on your post: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`,
                link: `/feed?postId=${post._id}&focus=comments`,
                metadata: { postId: post._id },
            })
        }

        return NextResponse.json({
            success: true,
            data: newComment,
            commentCount: post.comments.length,
        })
    } catch (error) {
        console.error('Add comment error:', error)
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 })
    }
}
