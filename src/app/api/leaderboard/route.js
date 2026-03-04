import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'
import { Server } from 'socket.io'

/**
 * Socket.IO Singleton & Change Stream Initialization
 * Since Next.js App Router route handlers are isolated, we use a global singleton
 * to host a standalone Socket.IO server on a separate port for real-time updates.
 */
let io
if (process.env.NODE_ENV !== 'production') {
    if (!global._io) {
        // Start Socket.IO server on a separate port (3002) for real-time live rankings
        // This keeps the logic contained within the leaderboard feature context.
        const port = 3002
        global._io = new Server(port, {
            cors: {
                origin: '*', // Adjust for production
                methods: ['GET', 'POST'],
            },
        })
        console.log(`[Socket.IO] Real-time leaderboard server started on port ${port}`)

        // Initialize MongoDB Change Stream to watch for Score updates
        dbConnect().then(() => {
            const userChangeStream = User.watch([], { fullDocument: 'updateLookup' })

            userChangeStream.on('change', (change) => {
                if (change.operationType === 'update' || change.operationType === 'replace') {
                    const statsChanged =
                        change.updateDescription?.updatedFields?.stats ||
                        change.updateDescription?.updatedFields?.['stats.score']

                    if (statsChanged) {
                        // Broadcast update to all connected clients
                        global._io.emit('rank_update', {
                            type: 'score_changed',
                            userId: change.documentKey._id,
                            timestamp: new Date(),
                        })
                    }
                }
            })
            console.log('[Socket.IO] MongoDB Change Stream active on User collection')
        })
    }
    io = global._io
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
