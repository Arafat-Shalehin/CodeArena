import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { protect } from '@/middlewares/auth.middleware'
import { User } from '@/models/User.models'
import { recommendationService } from '@/services/recommendation.service'

// Use revalidation for better caching - data refreshes every 5 minutes
export const revalidate = 300

export async function GET(req) {
    try {
        await dbConnect()

        const userAuth = await protect(req)
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
        console.error('Daily Picks API Error:', error)

        const status = error.status || 500
        const message = error.message || 'Failed to fetch daily picks'

        return NextResponse.json({ success: false, error: message }, { status })
    }
}
