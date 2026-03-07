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
        const league = searchParams.get('league') || 'all'
        const timeframe = searchParams.get('timeframe') || 'all_time'
        const currentUserId = searchParams.get('currentUserId')

        const skip = (page - 1) * limit
        const query = {}

        // 1. Handle Search
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
            ]
        }

        // 2. Handle League (Friends or Location/Company Filter)
        if (league === 'friends' && currentUserId) {
            const currentUser = await User.findById(currentUserId).select('following')
            if (currentUser && currentUser.following.length > 0) {
                query._id = { $in: currentUser.following }
            } else if (currentUser) {
                query._id = { $in: [] }
            }
        } else if (league === 'company' && currentUserId) {
            const currentUser = await User.findById(currentUserId).select('location')
            if (currentUser && currentUser.location) {
                query.location = currentUser.location
            } else {
                // If user has no location, maybe show global or empty
                query.location = '__NON_EXISTENT__'
            }
        }

        let users = []
        let total = 0

        // 3. Handle Timeframe (Aggregation for Weekly/Monthly)
        if (timeframe === 'weekly' || timeframe === 'monthly') {
            const days = timeframe === 'weekly' ? 7 : 30
            const today = new Date()
            const dateStrings = []

            for (let i = 0; i < days; i++) {
                const d = new Date(today)
                d.setDate(d.getDate() - i)
                dateStrings.push(d.toISOString().split('T')[0])
            }

            // Aggregation pipeline to sum activity for the selected timeframe
            const pipeline = [
                { $match: query },
                {
                    $addFields: {
                        timeframeScore: {
                            $sum: {
                                $map: {
                                    input: dateStrings,
                                    as: 'dateKey',
                                    in: {
                                        $ifNull: [
                                            {
                                                $getField: {
                                                    field: '$$dateKey',
                                                    input: {
                                                        $ifNull: ['$stats.activityCalendar', {}],
                                                    },
                                                },
                                            },
                                            0,
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
                { $sort: { timeframeScore: -1, 'stats.score': -1 } },
                {
                    $facet: {
                        metadata: [{ $count: 'total' }],
                        data: [{ $skip: skip }, { $limit: limit }],
                    },
                },
            ]

            const results = await User.aggregate(pipeline)
            users = results[0].data
            total = results[0].metadata[0]?.total || 0

            // Mapping to ensure consistent output format
            users = users.map((u) => ({
                ...u,
                stats: {
                    ...u.stats,
                    // Optionally override displayed score with timeframe score if desired
                    // score: u.timeframeScore
                },
            }))
        } else {
            // Standard All-Time approach
            ;[users, total] = await Promise.all([
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
        }

        return NextResponse.json({
            success: true,
            data: users,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
            livePort: 3002,
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
