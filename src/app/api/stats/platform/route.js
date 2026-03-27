import dbConnect from '@/lib/mongodb'
import { Submission } from '@/models/Submission.models'
import { User } from '@/models/User.models'
import { Contest } from '@/models/Contest.models'
import { StatsHistory } from '@/models/StatsHistory.models'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/stats/platform
 * Returns global platform statistics including 7-day trends and sparkline data.
 */
export async function GET() {
    try {
        await dbConnect()

        // 1. Current Stats
        // Total Participants (Users with at least one submission)
        const totalParticipants = await User.countDocuments({
            'stats.totalSubmissions': { $gt: 0 },
        })

        // Submissions Today (Last 24 hours)
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const submissionsToday = await Submission.countDocuments({
            createdAt: { $gte: last24h },
        })

        // Active Contests
        const activeContests = await Contest.countDocuments({
            status: 'active',
            isDeleted: false,
        })

        // Avg. Solve Rate
        const aggregateStats = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalAccepted: { $sum: '$stats.accepted' },
                    totalSubmissions: { $sum: '$stats.totalSubmissions' },
                },
            },
        ])

        const { totalAccepted = 0, totalSubmissions = 0 } = aggregateStats[0] || {}
        const currentSolveRate =
            totalSubmissions > 0
                ? parseFloat(((totalAccepted / totalSubmissions) * 100).toFixed(1))
                : 0

        // 2. Fetch History (Last 7 days)
        const history = await StatsHistory.find().sort({ date: -1 }).limit(7).lean()

        // Reverse to get chronological order for sparklines
        const chronologicalHistory = [...history].reverse()

        // Helper to calculate trend vs yesterday (history[0] is the most recent snapshot)
        const calculateTrend = (current, previous) => {
            if (!previous || previous === 0) return 0
            return parseFloat((((current - previous) / previous) * 100).toFixed(1))
        }

        // Detect if the most recent history record is from today
        const todayStr = new Date().setHours(0, 0, 0, 0)
        const historyIsFromToday = history[0] && new Date(history[0].date).getTime() === todayStr

        // Define "Yesterday" for trend calculation:
        // If history[0] is today, use history[1]. Otherwise use history[0].
        const lastSnapshot = historyIsFromToday ? history[1] || {} : history[0] || {}

        // Format history arrays for sparklines
        const participantsHistory = chronologicalHistory.map((h) => h.totalParticipants)
        const submissionsHistory = chronologicalHistory.map((h) => h.submissionsCount)
        const solveRateHistory = chronologicalHistory.map((h) => h.solveRate)
        const contestsHistory = chronologicalHistory.map((h) => h.activeContests)

        // Add today's live value to the end of history if not already snapshotted
        if (!historyIsFromToday) {
            participantsHistory.push(totalParticipants)
            submissionsHistory.push(submissionsToday)
            solveRateHistory.push(currentSolveRate)
            contestsHistory.push(activeContests)
        }

        // Keep only last 7 points for visual consistency
        const finalHistory = (arr) => arr.slice(-7)

        return NextResponse.json({
            success: true,
            data: {
                totalParticipants,
                submissionsToday,
                activeContests,
                avgSolveRate: `${currentSolveRate}%`,

                // History for Sparklines
                participantsHistory: finalHistory(participantsHistory),
                submissionsHistory: finalHistory(submissionsHistory),
                solveRateHistory: finalHistory(solveRateHistory),
                contestsHistory: finalHistory(contestsHistory),

                // Trends vs Last Snapshot
                participantsTrend: calculateTrend(
                    totalParticipants,
                    lastSnapshot.totalParticipants
                ),
                submissionsTrend: calculateTrend(submissionsToday, lastSnapshot.submissionsCount),
                solveRateTrend: calculateTrend(currentSolveRate, lastSnapshot.solveRate),
                contestsTrend: calculateTrend(activeContests, lastSnapshot.activeContests),

                participantsTrendUp: totalParticipants >= (lastSnapshot.totalParticipants || 0),
                submissionsTrendUp: submissionsToday >= (lastSnapshot.submissionsCount || 0),
                solveRateTrendUp: currentSolveRate >= (lastSnapshot.solveRate || 0),
                contestsTrendUp: activeContests >= (lastSnapshot.activeContests || 0),
            },
        })
    } catch (error) {
        console.error('[PlatformStatsAPI] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch platform stats' },
            { status: 500 }
        )
    }
}
