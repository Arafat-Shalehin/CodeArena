import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'
import { protect } from '@/middlewares/auth.middleware'
import { NextResponse } from 'next/server'
import { recommendationService } from '@/services/recommendation.service'

export const dynamic = 'force-dynamic'

/**
 * A/B Testing: Hash User ID to a bucket (0-99)
 */
function hashUserId(userIdStr) {
    let hash = 0
    for (let i = 0; i < userIdStr.length; i++) {
        hash = (hash << 5) - hash + userIdStr.charCodeAt(i)
        hash |= 0 // Convert to 32bit integer
    }
    return Math.abs(hash)
}

/**
 * GET /api/user/recommendations
 * Returns personalized problem recommendations based on user weaknesses and discovery.
 */
export async function GET(request) {
    try {
        await dbConnect()

        const userAuth = await protect(request)
        if (!userAuth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const user = await User.findById(userAuth.id).select('_id')
        if (!user) {
            return NextResponse.json({
                success: true,
                data: {
                    recommendations: [],
                },
            })
        }

        // Feature flags / A/B Testing Configuration
        const userBucket = hashUserId(userAuth.id.toString()) % 100

        // Roll out new ML engine to 50% of users to test
        const useNewEngine = userBucket < 50

        let recommendations = []
        let engineUsed = ''

        if (useNewEngine) {
            engineUsed = 'ml-multi-signal'
            // Use the centralized recommendation service we built
            recommendations = await recommendationService.getRecommendations(userAuth.id, 6)
        } else {
            engineUsed = 'legacy-rule-based'
            // Fallback to basic random discovery logic as placeholder for A/B testing
            recommendations = await recommendationService.getDiscoveryProblems(userAuth.id, 6)
        }

        return NextResponse.json({
            success: true,
            engine: engineUsed,
            bucket: userBucket,
            data: {
                recommendations,
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
