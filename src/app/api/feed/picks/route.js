import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { protect } from '@/middlewares/auth.middleware'
import { User } from '@/models/User.models'
import { recommendationService } from '@/services/recommendation.service'

// Authenticated endpoint (uses request headers/cookies), must be dynamic.
export const dynamic = 'force-dynamic'

export async function GET(req) {
    try {
        await dbConnect()

        let userAuth = null
        try {
            userAuth = await protect(req)
        } catch (authError) {
            if (authError?.status !== 401) {
                throw authError
            }
        }

        if (!userAuth?.id) {
            return NextResponse.json({
                success: true,
                data: {
                    picks: [],
                },
            })
        }

        const user = await User.findById(userAuth.id).select('stats performanceStats').lean()
        const picks = await recommendationService.getRecommendations(userAuth.id, 4, {
            user,
            context: 'feed',
        })

        return NextResponse.json({
            success: true,
            data: {
                picks,
            },
        })
    } catch (error) {
        if (error?.status !== 401) {
            console.error('Daily Picks API Error:', error)
        }

        const status = error.status || 500
        const message = error.message || 'Failed to fetch daily picks'

        return NextResponse.json({ success: false, error: message }, { status })
    }
}
