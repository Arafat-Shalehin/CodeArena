import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'
import { Problem } from '@/models/Problem.models'
import { protect } from '@/middlewares/auth.middleware'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/user/recommendations
 * Returns a list of recommended problems based on the user's weak tags.
 */
export async function GET(request) {
    try {
        await dbConnect()

        const userAuth = await protect(request)
        if (!userAuth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch full user to get performanceStats and stats.solvedProblems
        const user = await User.findById(userAuth._id).select(
            'performanceStats stats.solvedProblems'
        )

        let weakTags = []
        if (user.performanceStats && user.performanceStats.size > 0) {
            // Convert Map to Array for sorting
            const statsArray = Array.from(user.performanceStats.entries()).map(([tag, stats]) => {
                const totalAttempts = stats.attempted || 0
                const solvedCount = stats.solved || 0
                const failedCount = stats.failed || 0

                // Calculate weakness score: higher is weaker
                // Weighting failed attempts heavily
                let weaknessScore = 0
                if (totalAttempts > 0) {
                    const failRate = failedCount / totalAttempts
                    // Base score is failed count + weighted fail rate
                    weaknessScore = failedCount + failRate * 5
                }

                return { tag, weaknessScore }
            })

            // Sort descending by weaknessscore
            statsArray.sort((a, b) => b.weaknessScore - a.weaknessScore)

            // Take top 3 weakest tags
            weakTags = statsArray.slice(0, 3).map((item) => item.tag)
        }

        const solvedProblemIds = user.stats?.solvedProblems || []

        // Base query: not in solved problems
        const query = {
            _id: { $nin: solvedProblemIds },
        }

        // If we found weak tags, prefer those
        if (weakTags.length > 0) {
            query.tags = { $in: weakTags }
        }

        // Fetch recommended problems limit 5
        let recommendations = await Problem.find(query)
            .select('title difficulty acceptanceRate tags')
            .limit(5)
            .lean()

        // If we didn't find enough recommendations based on tags, backfill with random unsolved problems
        if (recommendations.length < 5) {
            const excludeIds = [...solvedProblemIds, ...recommendations.map((p) => p._id)]
            const backfill = await Problem.find({ _id: { $nin: excludeIds } })
                .select('title difficulty acceptanceRate tags')
                .limit(5 - recommendations.length)
                .lean()
            recommendations = [...recommendations, ...backfill]
        }

        return NextResponse.json({
            success: true,
            data: {
                weakTags: weakTags,
                recommendations: recommendations,
            },
        })
    } catch (error) {
        console.error('[RecommendationsAPI] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch recommendations' },
            { status: 500 }
        )
    }
}
