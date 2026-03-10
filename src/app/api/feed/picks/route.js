import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { protect } from '@/middlewares/auth.middleware'
import { Problem } from '@/models/Problem.models'
import { User } from '@/models/User.models'

export const dynamic = 'force-dynamic'

export async function GET(req) {
    try {
        await dbConnect()

        const userAuth = await protect(req)
        const user = await User.findById(userAuth.id).select('stats.solvedProblems')

        const solvedProblemIds = user?.stats?.solvedProblems || []

        // Fetch "daily picks" - Trending/Most Solved unsolved problems
        const picks = await Problem.find({
            _id: { $nin: solvedProblemIds },
        })
            .select('title difficulty acceptanceRate tags acceptedSubmissions')
            .sort({ acceptedSubmissions: -1 })
            .limit(4)
            .lean()

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
