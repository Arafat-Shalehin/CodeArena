import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'
import { Problem } from '@/models/Problem.models'
import { protect } from '@/middlewares/auth.middleware'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/user/recommendations
 * Returns personalized problem recommendations based on user weaknesses.
 * Uses multi-signal weakness scoring with recency, solve-streak dampening,
 * difficulty-aware filtering, and tag discovery.
 */
export async function GET(request) {
    try {
        await dbConnect()

        const userAuth = await protect(request)
        if (!userAuth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const user = await User.findById(userAuth.id).select(
            'performanceStats stats.solvedProblems'
        )

        if (!user) {
            // If the user isn't in MongoDB yet, they have no stats.
            // Return empty arrays so the frontend can display the 'Coming Soon' widget.
            return NextResponse.json({
                success: true,
                data: {
                    weakTags: [],
                    recommendations: [],
                    discoveryProblems: [],
                    discoveryTags: [],
                    userLevel: 'easy',
                },
            })
        }

        const solvedProblemIds = user.stats?.solvedProblems || []

        // --- Multi-Signal Weakness Scoring ---
        let weakTags = []
        if (user.performanceStats && user.performanceStats.size > 0) {
            const now = Date.now()

            const statsArray = Array.from(user.performanceStats.entries()).map(([tag, stats]) => {
                const totalAttempts = stats.attempted || 0
                const solvedCount = stats.solved || 0
                const failedCount = stats.failed || 0
                const recentSolveStreak = stats.recentSolveStreak || 0
                const lastAttemptDate = stats.lastAttemptDate

                let weaknessScore = 0
                if (totalAttempts > 0) {
                    const failRate = failedCount / totalAttempts

                    // Base score: failures weighted heavily, dampened by solve progress
                    const baseScore = (failedCount * 2 + failRate * 10) / (1 + solvedCount * 0.5)

                    // Recency multiplier: recent struggles are more relevant
                    let recencyMultiplier = 1.0
                    if (lastAttemptDate) {
                        const daysSince =
                            (now - new Date(lastAttemptDate).getTime()) / (1000 * 60 * 60 * 24)
                        if (daysSince < 7) recencyMultiplier = 1.5
                        else if (daysSince > 30) recencyMultiplier = 0.5
                    }

                    // Solve streak dampening: if user is on a solving streak, reduce weakness
                    weaknessScore = (baseScore * recencyMultiplier) / (1 + recentSolveStreak * 0.3)
                }

                return { tag, weaknessScore }
            })

            statsArray.sort((a, b) => b.weaknessScore - a.weaknessScore)
            weakTags = statsArray.slice(0, 3).map((item) => item.tag)
        }

        // --- Difficulty Ladder ---
        const totalSolved = solvedProblemIds.length
        let targetDifficulty
        if (totalSolved < 10) {
            targetDifficulty = 'easy'
        } else if (totalSolved < 50) {
            targetDifficulty = 'medium'
        }

        // --- Weakness-Based Recommendations ---
        const query = {
            _id: { $nin: solvedProblemIds },
        }

        if (weakTags.length > 0) {
            query.tags = { $in: weakTags }
        }

        if (targetDifficulty) {
            query.difficulty = targetDifficulty
        }

        let recommendations = await Problem.find(query)
            .select('title difficulty acceptanceRate tags')
            .sort({ acceptanceRate: -1 })
            .limit(3)
            .lean()

        // Backfill weakness recommendations if not enough found
        if (recommendations.length < 3) {
            const excludeIds = [...solvedProblemIds, ...recommendations.map((p) => p._id)]
            const backfillQuery = { _id: { $nin: excludeIds } }
            if (targetDifficulty) backfillQuery.difficulty = targetDifficulty

            const backfill = await Problem.find(backfillQuery)
                .select('title difficulty acceptanceRate tags')
                .sort({ acceptanceRate: -1 })
                .limit(3 - recommendations.length)
                .lean()
            recommendations = [...recommendations, ...backfill]
        }

        // --- Tag Discovery ---
        // Find easy problems from popular tags the user hasn't tried yet
        let discoveryProblems = []
        let discoveryTags = []
        const triedTags = user.performanceStats ? Array.from(user.performanceStats.keys()) : []

        const allTags = await Problem.distinct('tags')
        const untouchedTags = allTags.filter((t) => !triedTags.includes(t))

        if (untouchedTags.length > 0) {
            discoveryTags = untouchedTags.slice(0, 3)
            const existingIds = [...solvedProblemIds, ...recommendations.map((p) => p._id)]

            discoveryProblems = await Problem.find({
                tags: { $in: discoveryTags },
                difficulty: 'easy',
                _id: { $nin: existingIds },
            })
                .select('title difficulty acceptanceRate tags')
                .sort({ acceptanceRate: -1 })
                .limit(2)
                .lean()
        }

        return NextResponse.json({
            success: true,
            data: {
                weakTags,
                recommendations,
                discoveryProblems,
                discoveryTags,
                userLevel: targetDifficulty || 'advanced',
            },
        })
    } catch (error) {
        console.error('[RecommendationsAPI] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch recommendations', details: error.message },
            { status: 500 }
        )
    }
}
