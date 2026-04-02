import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Submission } from '@/models/Submission.models'
import { protect } from '@/middlewares/auth.middleware'
import { resolveNotificationActorName } from '@/services/notification.service'

/**
 * GET /api/submissions/[id]/comments
 * Fetch comments for an accepted submission (populated with user info).
 */
export async function GET(req, { params }) {
    try {
        await dbConnect()
        const { id } = await params
        const { searchParams } = new URL(req.url)
        const parsedLimit = Number.parseInt(searchParams.get('limit') || '20', 10)
        const limit = Number.isNaN(parsedLimit) ? 20 : Math.min(Math.max(parsedLimit, 1), 50)
        const cursorRaw = searchParams.get('cursor')
        const cursorDate = cursorRaw ? new Date(cursorRaw) : null
        const hasValidCursor = cursorDate && !Number.isNaN(cursorDate.getTime())

        const submission = await Submission.findById(id)
            .select('comments')
            .populate('comments.userId', 'name avatarSeed')
            .lean()

        if (!submission) {
            return NextResponse.json(
                { success: false, message: 'Submission not found' },
                { status: 404 }
            )
        }

        const sortedComments = (submission.comments || []).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
        const filteredComments = hasValidCursor
            ? sortedComments.filter((comment) => new Date(comment.createdAt) < cursorDate)
            : sortedComments
        const comments = filteredComments.slice(0, limit)
        const nextCursor =
            filteredComments.length > limit && comments[comments.length - 1]?.createdAt
                ? new Date(comments[comments.length - 1].createdAt).toISOString()
                : null

        return NextResponse.json({
            success: true,
            data: comments,
            pagination: {
                hasMore: Boolean(nextCursor),
                nextCursor,
                count: comments.length,
            },
            totalCount: sortedComments.length,
        })
    } catch (error) {
        console.error('Get submission comments error:', error)
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 })
    }
}

/**
 * POST /api/submissions/[id]/comments
 * Add a comment to an accepted submission.
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

        const submission = await Submission.findById(id)
        if (!submission) {
            return NextResponse.json(
                { success: false, message: 'Submission not found' },
                { status: 404 }
            )
        }

        // Initialize comments for older documents if missing
        if (!submission.comments) {
            submission.comments = []
        }

        // Create comment using Mongoose's subdocument creation
        const comment = submission.comments.create({
            userId: user._id,
            text: text.trim(),
        })

        submission.comments.push(comment)
        await submission.save()

        // Populate the newly added comment's user info
        await submission.populate('comments.userId', 'name avatarSeed')

        // Get the newly added comment with populated user info
        const newComment = submission.comments[submission.comments.length - 1].toObject()

        // Notify submission owner if someone else commented
        if (submission.userId.toString() !== user._id.toString()) {
            const { sendNotification } = await import('@/services/notification.service')
            const actorName = await resolveNotificationActorName(user)
            await sendNotification({
                recipientId: submission.userId,
                senderId: user._id,
                type: 'social',
                message: `${actorName} commented on your submission: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`,
                link: `/feed`,
                metadata: { submissionId: submission._id },
            })
        }

        return NextResponse.json({
            success: true,
            data: newComment,
            commentCount: submission.comments.length,
        })
    } catch (error) {
        console.error('Add submission comment error:', error)
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 })
    }
}
