export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/mongodb'
import { Contest } from '@/models/Contest.models'
import { Problem } from '@/models/Problem.models'
import { asyncHandler } from '@/lib/asyncHandler'

/**
 * GET /api/contests/:id/problems-full
 * Fetches the full problem details for all problems associated with the contest.
 * Intended for use within the Contest Arena to preload problem data.
 */
export const GET = asyncHandler(async (req, context) => {
    await dbConnect()

    // Note: next.js app router context parameters are technically promised
    const params = await context.params
    const { id } = params

    const contest = await Contest.findById(id).lean()

    if (!contest) {
        return Response.json({ success: false, message: 'Contest not found' }, { status: 404 })
    }

    // Only allow fetching if contest is active or completed
    const now = new Date()
    if (now < new Date(contest.startTime)) {
        return Response.json(
            { success: false, message: 'Contest has not started yet' },
            { status: 403 }
        )
    }

    const problemIds = contest.problemIds || []

    // Fetch full problems and sort them to match the order in the contest
    const problems = await Problem.find({
        _id: { $in: problemIds },
    }).lean()

    // Map by ID for O(1) retrieval
    const problemsMap = problems.reduce((acc, p) => {
        acc[p._id.toString()] = p
        return acc
    }, {})

    // Reconstruct sorted array
    const sortedProblems = problemIds.map((pid) => problemsMap[pid.toString()]).filter(Boolean)

    return Response.json({
        success: true,
        data: sortedProblems,
    })
})
