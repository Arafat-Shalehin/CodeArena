import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'
import { protect } from '@/middlewares/auth.middleware'
import { NextResponse } from 'next/server'
import { recommendationService } from '@/services/recommendation.service'
import { buildContextualRecommendations } from '@/services/recommendation-context.service'
import { recommendationCacheService } from '@/services/cache.service'

// User-specific recommendations use Redis caching, but keep dynamic for personalization
// The cache service handles TTL (2 hours)

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

        const userId = userAuth.id.toString()
        const { searchParams } = new URL(request.url)
        const context = searchParams.get('context') === 'feed' ? 'feed' : 'profile'

        // Define cacheParams at the top level so it's accessible throughout
        const cacheParams = { context, limit: 6, includeDiscovery: true }

        // --- Check full-payload cache first ---
        try {
            const cached = await recommendationCacheService.get(userId, cacheParams)
            if (cached) {
                return NextResponse.json({ success: true, source: 'cache', ...cached })
            }
        } catch (cacheError) {
            console.warn(
                '[RecommendationsAPI] Cache error, proceeding with fresh data:',
                cacheError.message
            )
        }

        const user = await User.findById(userId).select('_id stats performanceStats')
        if (!user) {
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

        let recommendationPool = []
        let discoveryPool = []
        let weakTags = []

        try {
            recommendationPool = await recommendationService.getRecommendations(userId, 12, {
                user: user.toObject ? user.toObject() : user,
                context,
            })
        } catch (recError) {
            console.error('[RecommendationsAPI] getRecommendations error:', recError.message)
            recommendationPool = []
        }

        try {
            // --- Build weakTags from performanceStats ---
            const perfStats = user.performanceStats || {}
            const perfStatsObj =
                typeof perfStats.toJSON === 'function' ? perfStats.toJSON() : { ...perfStats }
            const weakTagObjects = recommendationService.getUserWeakTags(perfStatsObj)
            weakTags = weakTagObjects.slice(0, 3).map((w) => w.tag)
        } catch (weakTagsError) {
            console.error('[RecommendationsAPI] getUserWeakTags error:', weakTagsError.message)
            weakTags = []
        }

        try {
            discoveryPool = await recommendationService.getDiscoveryProblems(userId, 6, {
                user: user.toObject ? user.toObject() : user,
                context,
            })
        } catch (discoveryError) {
            console.error(
                '[RecommendationsAPI] getDiscoveryProblems error:',
                discoveryError.message
            )
            discoveryPool = []
        }

        const { recommendations, discoveryProblems } = buildContextualRecommendations({
            context,
            recommendationPool: recommendationPool || [],
            discoveryPool: discoveryPool || [],
            profileLimit: 6,
            feedLimit: 6,
            discoveryLimit: 3,
        })

        const payload = {
            engine: `ai-contextual-${context}`,
            context,
            data: {
                weakTags: weakTags || [],
                recommendations: recommendations || [],
                discoveryProblems: discoveryProblems || [],
                discoveryTags:
                    discoveryProblems
                        ?.map((p) => p.tags?.[0])
                        .filter(Boolean)
                        .slice(0, 3) || [],
            },
        }

        // Persist to cache for short-lived performance boost
        try {
            await recommendationCacheService.set(userId, cacheParams, payload)
        } catch (cacheSetError) {
            console.warn('[RecommendationsAPI] Cache set error:', cacheSetError.message)
        }

        return NextResponse.json({ success: true, source: 'fresh', ...payload })
    } catch (error) {
        console.error('[RecommendationsAPI] Critical Error:', error)
        // Return graceful fallback instead of 500
        return NextResponse.json({
            success: true,
            data: {
                weakTags: [],
                recommendations: [],
                discoveryProblems: [],
                discoveryTags: [],
            },
            error: 'Recommendations temporarily unavailable',
        })
    }
}
