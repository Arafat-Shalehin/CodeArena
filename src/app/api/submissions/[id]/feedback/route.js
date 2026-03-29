export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/mongodb'
import { NextResponse } from 'next/server'
import { Submission } from '@/models/Submission.models'

/**
 * GET /api/submissions/[id]/feedback
 * Fetches the AI feedback for a specific submission
 */
export async function GET(request, { params }) {
    try {
        await dbConnect()

        const { id } = await params

        if (!id) {
            return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 })
        }

        const submission = await Submission.findById(id).select('aiFeedback status verdict').lean()

        if (!submission) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
        }

        // If verdict is not AC or TLE, we didn't run AI analysis
        if (
            submission.verdict &&
            submission.verdict !== 'accepted' &&
            submission.verdict !== 'time_limit_exceeded'
        ) {
            return NextResponse.json({
                success: true,
                status: 'NOT_ELIGIBLE',
                message:
                    'AI Feedback is only available for Accepted or Time Limit Exceeded submissions.',
                feedback: null,
            })
        }

        // If we expect feedback but it hasn't arrived yet (Gemini is still processing)
        if (!submission.aiFeedback) {
            return NextResponse.json({
                success: true,
                status: 'PROCESSING',
                message:
                    'AI Feedback is currently being generated in the background. Please poll again.',
                feedback: null,
            })
        }

        // Feedback is ready
        return NextResponse.json({
            success: true,
            status: 'READY',
            feedback: submission.aiFeedback,
        })
    } catch (error) {
        console.error('Error fetching AI feedback:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch AI feedback',
                message: error.message,
            },
            { status: 500 }
        )
    }
}
