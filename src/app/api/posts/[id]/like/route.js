import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Post } from '@/models/Post.models'
import { protect } from '@/middlewares/auth.middleware'

export async function POST(req, { params }) {
    try {
        await dbConnect()
        const { id } = await params

        const user = await protect(req)
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const post = await Post.findById(id)
        if (!post) {
            return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 })
        }

        const userId = user._id.toString()
        const likeIndex = post.likes.indexOf(userId)

        let action = ''
        if (likeIndex === -1) {
            post.likes.push(userId)
            action = 'liked'

            // NEW: Send Real-time Notification to the post owner
            if (post.userId.toString() !== userId) {
                const { sendNotification } = await import('@/services/notification.service')
                await sendNotification({
                    recipientId: post.userId,
                    senderId: user._id,
                    type: 'social',
                    message: `${user.name} liked your post: "${post.content.substring(0, 30)}${post.content.length > 30 ? '...' : ''}"`,
                    link: `/feed`,
                    metadata: {
                        postId: post._id,
                    },
                })
            }
        } else {
            post.likes.splice(likeIndex, 1)
            action = 'unliked'
        }

        await post.save()

        return NextResponse.json({
            success: true,
            likes: post.likes.length,
            action,
        })
    } catch (error) {
        console.error('Like post error:', error)
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 })
    }
}
