import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Submission } from '@/models/Submission.models'
import { protect } from '@/middlewares/auth.middleware'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

export async function POST(req, { params }) {
    try {
        await dbConnect()

        // Authenticate user
        const user = await protect(req)
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const resolvedParams = await params
        const submissionId = resolvedParams.id

        // Use atomic toggle if possible, but we need to know whether it was added or removed
        // So we still fetch or use the return document

        // 1. Fetch current state
        const submission = await Submission.findById(submissionId)
        if (!submission) {
            return NextResponse.json(
                { success: false, message: 'Submission not found' },
                { status: 404 }
            )
        }

        const likesArray = submission.likes || []
        const userIdStr = user._id.toString()
        const hasLiked = likesArray.some((id) => id.toString() === userIdStr)

        let action = ''
        let updatedDoc = null

        const userIdObj = new mongoose.Types.ObjectId(userIdStr)

        if (hasLiked) {
            // Unlike
            updatedDoc = await Submission.findByIdAndUpdate(
                submissionId,
                { $pull: { likes: userIdObj } },
                { new: true }
            )
            action = 'unliked'
        } else {
            // Like
            updatedDoc = await Submission.findByIdAndUpdate(
                submissionId,
                { $addToSet: { likes: userIdObj } },
                { new: true }
            )
            action = 'liked'
        }

        return NextResponse.json({
            success: true,
            action,
            likes: updatedDoc?.likes?.length || 0,
            hasLiked: action === 'liked',
            message: `Successfully ${action} submission`,
        })
    } catch (error) {
        console.error('Error toggling congratulate:', error)
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 })
    }
}
