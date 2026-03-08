import dbConnect from '@/lib/mongodb'
import { Submission } from '@/models/Submission.models'
import { protect } from '@/middlewares/auth.middleware'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/user/problems-status
 * Returns a list of problem IDs that the authenticated user has solved.
 */
export async function GET(request) {
    try {
        await dbConnect()

        const user = await protect(request)
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        // Find all unique problem IDs the user has interacted with
        const allAttempts = await Submission.find({ userId: user._id }).distinct('problemId')

        // Find all accepted submissions for this user
        const solvedProblems = await Submission.find({
            userId: user._id,
            verdict: { $regex: new RegExp('^ACCEPTED$', 'i') },
        }).distinct('problemId')

        // Attempted but NOT solved
        const attemptedIds = allAttempts.filter(
            (id) => !solvedProblems.some((s) => s.toString() === id.toString())
        )

        return NextResponse.json({
            success: true,
            data: {
                solvedIds: solvedProblems,
                attemptedIds: attemptedIds,
            },
        })
    } catch (error) {
        console.error('[UserStatusAPI] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch user status' },
            { status: 500 }
        )
    }
}
