import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Submission } from '@/models/Submission.models'
import { protect } from '@/middlewares/auth.middleware'
import mongoose from 'mongoose'
import { resolveNotificationActorName } from '@/services/notification.service'

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

            // NEW: Send Real-time Notification to the submission owner
            const { sendNotification } = await import('@/services/notification.service')
            if (submission.userId.toString() !== userIdStr) {
                const actorName = await resolveNotificationActorName(user)
                // Get problem title for the message if possible
                const { Problem } = await import('@/models/Problem.models')
                const problem = await Problem.findById(submission.problemId).select('title')

                await sendNotification({
                    recipientId: submission.userId,
                    senderId: user._id,
                    type: 'social',
                    message: `${actorName} congratulated you on your solution for "${problem?.title || 'a problem'}"`,
                    link: `/problems/${submission.problemId}`,
                    metadata: {
                        submissionId: submission._id,
                        problemId: submission.problemId,
                    },
                })
            }
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
