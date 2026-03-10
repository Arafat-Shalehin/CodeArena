import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Post } from '@/models/Post.models'
import { protect } from '@/middlewares/auth.middleware'

export async function POST(req) {
    try {
        await dbConnect()

        const user = await protect(req)
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const { content } = await req.json()
        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: 'Content is required' },
                { status: 400 }
            )
        }

        const post = await Post.create({
            userId: user._id,
            content,
        })

        await post.populate({
            path: 'userId',
            select: 'name avatarSeed',
        })

        return NextResponse.json({
            success: true,
            data: post,
        })
    } catch (error) {
        console.error('Create post error:', error)
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 })
    }
}
