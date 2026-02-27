import dbConnect from '@/lib/mongodb'
import { Submission } from '@/models/Submission.models'
import { User } from '@/models/User.models'
import { Contest } from '@/models/Contest.models'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/stats/platform
 * Returns global platform statistics.
 */
export async function GET() {
    try {
        await dbConnect()

        // 1. Total Participants (Users with at least one submission)
        const totalParticipants = await User.countDocuments({
            'stats.totalSubmissions': { $gt: 0 }
        })

        // 2. Submissions Today (Last 24 hours)
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const submissionsToday = await Submission.countDocuments({
            createdAt: { $gte: last24h }
        })

        // 3. Active Contests
        const activeContests = await Contest.countDocuments({
            status: 'active',
            isDeleted: false
        })

        // 4. Avg. Solve Rate
        const aggregateStats = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalAccepted: { $sum: '$stats.accepted' },
                    totalSubmissions: { $sum: '$stats.totalSubmissions' }
                }
            }
        ])

        const { totalAccepted = 0, totalSubmissions = 0 } = aggregateStats[0] || {}
        const solveRate = totalSubmissions > 0 
            ? ((totalAccepted / totalSubmissions) * 100).toFixed(1) 
            : 0

        return NextResponse.json({
            success: true,
            data: {
                totalParticipants,
                submissionsToday,
                activeContests,
                avgSolveRate: `${solveRate}%`
            }
        })
    } catch (error) {
        console.error('[PlatformStatsAPI] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch platform stats' },
            { status: 500 }
        )
    }
}
