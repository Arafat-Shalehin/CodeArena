import { NextResponse } from 'next/server'
import { protect } from '@/middlewares/auth.middleware'
import { UserInterviewStats } from '@/models/UserInterviewStats.model'
import { UserAggregateStats } from '@/models/UserAggregateStats.model'
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
        if (redisClient.isOpen) {
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
        }

        // 3. Optimized Aggregate Data Lookup
        let aggregate = await UserAggregateStats.findOne({ userId: user.id }).lean()

        if (!aggregate) {
            console.log(`[Stats] Backfill triggered for userId: ${user.id}`)
            const userIdObj = new mongoose.Types.ObjectId(user.id)

            // Step A: Run extraction for basic stats
            const [basicAgg] = await UserInterviewStats.aggregate([
                { $match: { userId: userIdObj } },
                {
                    $group: {
                        _id: null,
                        totalSessions: { $sum: 1 },
                        processedSessionIds: { $push: '$sessionId' },
                    },
                },
            ])

            // Step B: Run extraction for weaknesses frequency
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

            const weaknessFrequencyMap = {}
            weaknessAgg.forEach((w) => {
                if (w._id) {
                    const safeKey = w._id.replace(/[.$]/g, '_')
                    weaknessFrequencyMap[safeKey] = w.count
                }
            })

            // Step C: Atomic Upsert Backfill
            aggregate = await UserAggregateStats.findOneAndUpdate(
                { userId: user.id },
                {
                    $setOnInsert: {
                        totalSessions: basicAgg?.totalSessions || 0,
                        weaknessFrequency: weaknessFrequencyMap,
                        processedSessions: basicAgg?.processedSessionIds || [],
                        lastUpdated: new Date(),
                    },
                },
                { upsert: true, new: true }
            ).lean()
        } else {
            console.log(`[Stats] Using cached aggregate for user ${user.id}`)
        }

        // 4. Fetch raw history (Required for the recent sessions list)
        const rawHistory = await UserInterviewStats.find({ userId: user.id })
            .sort({ completedAt: -1 })
            .limit(LIMIT)
            .populate('problemId', 'title difficulty')
            .lean()

        // 5. Additional calculated summaries
        // Note: avgScore and bestScore remain dynamic or can be added to the model later.
        // For now, we perform a lean aggregate just for scores if needed,
        // but to KEEP IT O(1) for the main dashboard, we use these derived from history or model.
        const [scoreAgg] = await UserInterviewStats.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(user.id) } },
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: '$overallScore' },
                    bestScore: { $max: '$overallScore' },
                },
            },
        ])

        const responsePayload = {
            success: true,
            isPremium,
            stats: rawHistory,
            summary: {
                totalSessions: aggregate.totalSessions,
                avgScore: scoreAgg?.avgScore ? Math.round(scoreAgg.avgScore) : 0,
                bestScore: scoreAgg?.bestScore || 0,
            },
            weaknessFrequency: aggregate.weaknessFrequency || {},
        }

        // 6. Redis Cache Write (TTL: 10 minutes)
        if (redisClient.isOpen) {
            try {
                await redisClient.set(cacheKey, JSON.stringify(responsePayload), { EX: 600 })
            } catch (err) {
                console.warn('[API/stats/me] Redis cache write failed:', err.message)
            }
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
