import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'
import { protect } from '@/middlewares/auth.middleware'
import { NextResponse } from 'next/server'
import { recommendationService } from '@/services/recommendation.service'
import { recommendationCacheService } from '@/services/cache.service'

export const dynamic = 'force-dynamic'

/**
 * A/B Testing: Hash User ID to a bucket (0-99)
 */
function hashUserId(userIdStr) {
    let hash = 0
    for (let i = 0; i < userIdStr.length; i++) {
        hash = (hash << 5) - hash + userIdStr.charCodeAt(i)
        hash |= 0
    }
    return Math.abs(hash)
}

/**
 * GET /api/user/recommendations
 * Returns personalized problem recommendations based on user weaknesses and discovery.
 *
 * Response shape (consumed by RecommendedProblems.jsx):
 *   data.recommendations   — weakness-matched + scored problems
 *   data.weakTags          — top 3 weak tag names (strings)
 *   data.discoveryProblems — easy problems in untouched tags
 *   data.discoveryTags     — names of the untouched tags
 */
export async function GET(request) {
    try {
        await dbConnect()

        const userAuth = await protect(request)
        if (!userAuth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const userId = userAuth.id.toString()

        // --- Check full-payload cache first ---
        const cacheParams = { limit: 6, includeDiscovery: true }
        const cached = await recommendationCacheService.get(userId, cacheParams)
        if (cached) {
            return NextResponse.json({ success: true, source: 'cache', ...cached })
        }

        const user = await User.findById(userId).select('_id stats performanceStats')
        if (!user) {
            return NextResponse.json({
                success: true,
                data: {
                    recommendations: [],
                    weakTags: [],
                    discoveryProblems: [],
                    discoveryTags: [],
                },
            })
        }

        // Feature flags / A/B Testing
        const userBucket = hashUserId(userId) % 100
        const useNewEngine = userBucket < 50

        let recommendations = []
        let engineUsed = ''

        if (useNewEngine) {
            engineUsed = 'ml-multi-signal'
            recommendations = await recommendationService.getRecommendations(userId, 6)
        } else {
            engineUsed = 'legacy-rule-based'
            recommendations = await recommendationService.getDiscoveryProblems(userId, 6)
        }

        // --- Build weakTags from performanceStats ---
        const perfStats = user.performanceStats || {}
        const perfStatsObj =
            typeof perfStats.toJSON === 'function' ? perfStats.toJSON() : { ...perfStats }
        const weakTagObjects = recommendationService.getUserWeakTags(perfStatsObj)
        const weakTags = weakTagObjects.slice(0, 3).map((w) => w.tag)

        // --- Build discovery data ---
        const discoveryLimit = Math.max(1, 3 - recommendations.filter((r) => r.isDiscovery).length)
        const discoveryProblems = await recommendationService.getDiscoveryProblems(
            userId,
            discoveryLimit
        )
        const discoveryTags = [
            ...new Set(discoveryProblems.flatMap((p) => p.tags || []).map((t) => t)),
        ].slice(0, 3)

        const payload = {
            engine: engineUsed,
            bucket: userBucket,
            data: {
                recommendations,
                weakTags,
                discoveryProblems,
                discoveryTags,
            },
        }

        // --- Persist to cache (1 hour TTL via CACHE_CONFIG) ---
        await recommendationCacheService.set(userId, cacheParams, payload)

        return NextResponse.json({ success: true, source: 'fresh', ...payload })
    } catch (error) {
        console.error('[RecommendationsAPI] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch recommendations', details: error.message },
            { status: 500 }
        )
    }
}
