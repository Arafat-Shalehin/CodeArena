import { NextResponse } from 'next/server'
import { Submission } from '@/models/Submission.models'
import { protect } from '@/middlewares/auth.middleware'
import dbConnect from '@/lib/mongodb'

/**
 * Admin GET handler — query parameters:
 *  - contestId (required)
 *  - page (default: 1)
 *  - limit (default: 20, max: 50)
 *  - onlySuspected (boolean, default: true)
 */
export async function GET(req) {
    try {
        await dbConnect()

        // 1. Authenticate (Admin only)
        const user = await protect(req)
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
        }

        // 2. Parse query parameters
        const { searchParams } = new URL(req.url)
        const contestId = searchParams.get('contestId')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
        const onlySuspected = searchParams.get('onlySuspected') !== 'false'

        if (!contestId) {
            return NextResponse.json({ error: 'contestId is required' }, { status: 400 })
        }

        // 3. Construct query
        const query = {
            contestId,
            plagiarismCheckedAt: { $ne: null },
        }
        if (onlySuspected) {
            query.suspectedPlagiarism = true
        }

        // 4. Execute query with pagination and population
        const submissions = await Submission.find(query)
            .select(
                'userId problemId similarityScore matchedSubmissions suspectedPlagiarism plagiarismCheckedAt language'
            )
            .populate('userId', 'username email')
            .populate('matchedSubmissions.userId', 'username')
            .sort({ similarityScore: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()

        const total = await Submission.countDocuments(query)

        // 5. Return result
        return NextResponse.json({
            data: submissions,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        })
    } catch (error) {
        console.error('[ADMIN PLAGIARISM API] Error:', error)
        return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }
}
