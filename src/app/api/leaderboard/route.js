import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/leaderboard
 * Fetches users ranked by points and accepted submissions.
 */
export async function GET(request) {
    try {
        await dbConnect()

        const { searchParams } = new URL(request.url)
        const page = Math.max(1, parseInt(searchParams.get('page')) || 1)
        const limit = Math.min(50, parseInt(searchParams.get('limit')) || 20)
        const search = searchParams.get('search') || ''
        const skip = (page - 1) * limit

        // Build query
        const query = { 'stats.totalSubmissions': { $gt: 0 } }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        }

        // Query users with activity, sorted by score then accepted count
        const users = await User.find(query)
            .select('name email stats createdAt')
            .sort({
                'stats.score': -1,
                'stats.accepted': -1
            })
            .skip(skip)
            .limit(limit)
            .lean()

        const total = await User.countDocuments(query)

        return NextResponse.json({
            success: true,
            data: users,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('[LeaderboardAPI] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch leaderboard' },
            { status: 500 }
        )
    }
}
