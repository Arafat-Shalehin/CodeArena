import { NextResponse } from 'next/server'
import { protect } from '@/middlewares/auth.middleware'
import { UserInterviewStats } from '@/models/UserInterviewStats.model'
import dbConnect from '@/lib/mongodb'
import { redisClient } from '@/lib/redis'
import mongoose from 'mongoose'

export async function GET(req) {
    await dbConnect()

    try {
        const user = await protect(req)

        // 1. Subscription Check
        // If the schema later implements .isPremium, this seamlessly adapts.
        const isPremium = user.isPremium === true || user.role === 'admin'
        const LIMIT = isPremium ? 20 : 2

        // 2. Redis Cache Lookup
        const cacheKey = `user:stats:${user.id}`
        try {
            const cachedParams = await redisClient.get(cacheKey)
            if (cachedParams) {
                const parsed = JSON.parse(cachedParams)
                // Cache hit! Ensure we slice it to the user's current tier limit
                // in case their subscription status just changed.
                parsed.stats = parsed.stats.slice(0, LIMIT)
                parsed.isPremium = isPremium
                return NextResponse.json(parsed, { status: 200 })
            }
        } catch (err) {
            console.warn('[API/stats/me] Redis cache read failed:', err.message)
        }

        // 3. MongoDB Aggregation Pipeline
        const userIdObj = new mongoose.Types.ObjectId(user.id)

        // a. Fetch the raw history stats (sorted descending)
        const rawStats = await UserInterviewStats.find({ userId: userIdObj })
            .sort({ completedAt: -1 })
            .limit(LIMIT)
            .populate('problemId', 'title difficulty')
            .lean()

        // b. Compute aggregate summaries
        const [aggregation] = await UserInterviewStats.aggregate([
            { $match: { userId: userIdObj } },
            {
                $group: {
                    _id: null,
                    totalSessions: { $sum: 1 },
                    avgScore: { $avg: '$overallScore' },
                    bestScore: { $max: '$overallScore' },
                },
            },
        ])

        const summary = {
            totalSessions: aggregation?.totalSessions || 0,
            avgScore: aggregation?.avgScore ? Math.round(aggregation.avgScore) : 0,
            bestScore: aggregation?.bestScore || 0,
        }

        // c. Compute weakness frequency map
        const weaknessAgg = await UserInterviewStats.aggregate([
            { $match: { userId: userIdObj } },
            { $unwind: '$weaknesses' },
            {
                $group: {
                    _id: '$weaknesses',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ])

        const weaknessFrequency = {}
        weaknessAgg.forEach((w) => {
            if (w._id) {
                weaknessFrequency[w._id] = w.count
            }
        })

        const responsePayload = {
            success: true,
            isPremium,
            stats: rawStats,
            summary,
            weaknessFrequency,
        }

        // 4. Redis Cache Write (TTL: 10 minutes)
        try {
            await redisClient.set(cacheKey, JSON.stringify(responsePayload), { EX: 600 })
        } catch (err) {
            console.warn('[API/stats/me] Redis cache write failed:', err.message)
        }

        return NextResponse.json(responsePayload, { status: 200 })
    } catch (error) {
        console.error('[API/stats/me] Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'SERVER_ERROR',
                message: error.message,
            },
            { status: error.status || 500 }
        )
    }
}
