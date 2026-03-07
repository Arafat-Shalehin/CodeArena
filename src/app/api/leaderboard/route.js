import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'
import { initSocketServer } from '@/lib/socket-server'

if (process.env.NODE_ENV !== 'production') {
    initSocketServer().catch(console.error)
}

/**
 * GET /api/leaderboard
 *
 * Fetches users ranked by points and accepted submissions.
 * Supports pagination, search, and placeholders for league/timeframe filtering.
 *
 * @param {Request} request - The incoming Next.js request object
 * @returns {Promise<NextResponse>} JSON response with ranked users and pagination metadata
 */
export async function GET(request) {
    try {
        await dbConnect()

        const { searchParams } = new URL(request.url)

        // Sanitize and parse query parameters
        const page = Math.max(1, parseInt(searchParams.get('page')) || 1)
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit')) || 20))
        const search = (searchParams.get('search') || '').trim()

        // Placeholders for future feature implementation
        const league = searchParams.get('league') || 'all'
        const timeframe = searchParams.get('timeframe') || 'all_time'

        const skip = (page - 1) * limit

        /**
         * Build the database query
         * We show all users by default to ensure maximum visibility.
         */
        const query = {}

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
            ]
        }

        /**
         * Query users with activity, sorted by score (primary) then accepted count (secondary)
         */
        const [users, total] = await Promise.all([
            User.find(query)
                .select('name username email stats createdAt')
                .sort({
                    'stats.score': -1,
                    'stats.accepted': -1,
                })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(query),
        ])

        return NextResponse.json({
            success: true,
            data: users,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
            livePort: 3002, // Notify frontend where to connect for live updates
        })
    } catch (error) {
        console.error('[LeaderboardAPI] Execution Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Internal Server Error',
                message: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
            { status: 500 }
        )
    }
}
