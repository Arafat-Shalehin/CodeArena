import dbConnect from '@/lib/mongodb'
import { Submission } from '@/models/Submission.models'
import { User } from '@/models/User.models'
import { Contest } from '@/models/Contest.models'
import { StatsHistory } from '@/models/StatsHistory.models'
import { NextResponse } from 'next/server'
import { redisClient } from '@/lib/redis'

export const dynamic = 'force-dynamic'

const PLATFORM_STATS_CACHE_KEY = 'stats:platform:v1'
const PLATFORM_STATS_CACHE_TTL_SECONDS = 30

/**
 * GET /api/stats/platform
 * Returns global platform statistics including 7-day trends and sparkline data.
 */
export async function GET() {
    try {
        if (redisClient.isOpen) {
            try {
                const cached = await redisClient.get(PLATFORM_STATS_CACHE_KEY)
                if (cached) {
                    return NextResponse.json({ success: true, data: JSON.parse(cached) })
                }
            } catch (err) {
                console.error('[PlatformStatsAPI] Redis read error:', err?.message || err)
            }
        }

        await dbConnect()

        // 1. Current Stats
        // Total Participants (Users with at least one submission)
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

        const [totalParticipants, submissionsToday, activeContests, aggregateStats, history] =
            await Promise.all([
                User.countDocuments({ 'stats.totalSubmissions': { $gt: 0 } }),
                Submission.countDocuments({ createdAt: { $gte: last24h } }),
                Contest.countDocuments({ status: 'active', isDeleted: false }),
                User.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalAccepted: { $sum: '$stats.accepted' },
                            totalSubmissions: { $sum: '$stats.totalSubmissions' },
                        },
                    },
                ]),
                StatsHistory.find().sort({ date: -1 }).limit(7).lean(),
            ])

        const { totalAccepted = 0, totalSubmissions = 0 } = aggregateStats[0] || {}
        const currentSolveRate =
            totalSubmissions > 0
                ? parseFloat(((totalAccepted / totalSubmissions) * 100).toFixed(1))
                : 0

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

        const payload = {
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
            participantsTrend: calculateTrend(totalParticipants, lastSnapshot.totalParticipants),
            submissionsTrend: calculateTrend(submissionsToday, lastSnapshot.submissionsCount),
            solveRateTrend: calculateTrend(currentSolveRate, lastSnapshot.solveRate),
            contestsTrend: calculateTrend(activeContests, lastSnapshot.activeContests),

            participantsTrendUp: totalParticipants >= (lastSnapshot.totalParticipants || 0),
            submissionsTrendUp: submissionsToday >= (lastSnapshot.submissionsCount || 0),
            solveRateTrendUp: currentSolveRate >= (lastSnapshot.solveRate || 0),
            contestsTrendUp: activeContests >= (lastSnapshot.activeContests || 0),
        }

        if (redisClient.isOpen) {
            redisClient
                .set(PLATFORM_STATS_CACHE_KEY, JSON.stringify(payload), {
                    EX: PLATFORM_STATS_CACHE_TTL_SECONDS,
                })
                .catch((err) => {
                    console.error('[PlatformStatsAPI] Redis write error:', err?.message || err)
                })
        }

        return NextResponse.json({
            success: true,
            data: payload,
        })
    } catch (error) {
        console.error('[PlatformStatsAPI] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch platform stats' },
            { status: 500 }
        )
    }
}
