import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { protect } from '@/middlewares/auth.middleware'
import { getRecommendedProblems } from '@/services/recommendation.service'

export async function GET(req) {
    try {
        await dbConnect()

        // Authenticate user
        const user = await protect(req)

        // Fetch recommendations
        const recommendations = await getRecommendedProblems(user.id)

        return NextResponse.json({
            success: true,
            data: recommendations,
        })
    } catch (error) {
        console.error('Recommendation API Error:', error)

        const status = error.status || 500
        const message = error.message || 'Failed to fetch recommendations'

        return NextResponse.json({ success: false, error: message }, { status })
    }
}
