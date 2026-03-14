import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'
import { protect } from '@/middlewares/auth.middleware'
import { NextResponse } from 'next/server'
import { getRecommendedProblems, getDiscoveryProblems } from '@/services/recommendation.service'

export const dynamic = 'force-dynamic'

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
                    weakTags: [],
                    recommendations: [],
                    discoveryProblems: [],
                    discoveryTags: [],
                    userLevel: 'easy',
                },
            })
        }

        // Use the centralized recommendation service
        const [recommendationResult, discoveryResult] = await Promise.all([
            getRecommendedProblems(userAuth.id, 3),
            getDiscoveryProblems(userAuth.id, 2),
        ])

        return NextResponse.json({
            success: true,
            data: {
                ...recommendationResult,
                ...discoveryResult,
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
