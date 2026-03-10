import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { protect } from '@/middlewares/auth.middleware'
import { redisClient } from '@/lib/redis'
import { Reaction } from '@/models/Reaction.models'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

const REACTION_TYPES = ['LIKE', 'LOVE', 'CLAP', 'THINKING', 'ROCKET', 'WOW']

export async function POST(req, { params }) {
    try {
        const user = await protect(req)
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const { id: problemId } = await params
        const { type } = await req.json()

        if (!REACTION_TYPES.includes(type)) {
            return NextResponse.json(
                { success: false, message: 'Invalid reaction type' },
                { status: 400 }
            )
        }

        const userId = user._id.toString()
        const redisUserKey = `user:${userId}:reacted:problem:${problemId}`
        const redisCountKey = `reactions:problem:${problemId}`
        const redisDirtyKey = `reactions:dirty_problems`

        // 1. Get current reaction from Redis (fast path)
        let currentReaction = await redisClient.get(redisUserKey)

        // If not in Redis, check DB (cache miss)
        if (currentReaction === null) {
            await dbConnect()
            const existingReaction = await Reaction.findOne({ userId, problemId })
            currentReaction = existingReaction ? existingReaction.type : 'NONE'
            await redisClient.set(redisUserKey, currentReaction, { EX: 86400 }) // Cache for 24h
        }

        const multi = redisClient.multi()

        if (currentReaction === type) {
            // Toggle off: User clicked the same reaction again
            multi.zIncrBy(redisCountKey, -1, type)
            multi.set(redisUserKey, 'NONE')
            // Register for async DB deletion
            await Reaction.deleteOne({ userId, problemId })
        } else {
            // If they had a different reaction, decrement the old one
            if (currentReaction !== 'NONE') {
                multi.zIncrBy(redisCountKey, -1, currentReaction)
            }
            // Increment the new one
            multi.zIncrBy(redisCountKey, 1, type)
            multi.set(redisUserKey, type)

            // Register for async DB update (Optimistic: we do it here or let worker handle it?)
            // The requirement says "Data Integrity: sync Redis counts with MongoDB every few minutes"
            // But we still need to store individual reactions to know which one the user picked.
            // I'll update the individual reaction directly for immediate consistency on user profile,
            // but the counts will be synced in bulk.
            await Reaction.findOneAndUpdate(
                { userId, problemId },
                { type, userId, problemId },
                { upsert: true }
            )
        }

        // Mark problem as dirty for syncing counts
        multi.sAdd(redisDirtyKey, problemId)
        await multi.exec()

        // Get updated counts (fast)
        const countsRaw = await redisClient.zRangeWithScores(redisCountKey, 0, -1)
        const counts = {}
        countsRaw.forEach(({ value, score }) => {
            counts[value] = Math.max(0, score)
        })

        // Broadcast update via Redis Pub/Sub for real-time Socket.io delivery
        await redisClient.publish(
            'reaction_updates',
            JSON.stringify({
                problemId,
                counts,
            })
        )

        return NextResponse.json({
            success: true,
            userReaction: currentReaction === type ? 'NONE' : type,
            counts,
        })
    } catch (error) {
        console.error('Reaction Error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function GET(req, { params }) {
    try {
        const { id: problemId } = await params
        const user = await protect(req).catch(() => null)

        const redisCountKey = `reactions:problem:${problemId}`

        // Try getting from Redis
        let countsRaw = await redisClient.zRangeWithScores(redisCountKey, 0, -1)

        // If empty, try to populate from MongoDB
        if (countsRaw.length === 0) {
            await dbConnect()
            const { Problem } = await import('@/models/Problem.models')
            const problem = await Problem.findById(problemId)
            if (problem && problem.reactionCounts) {
                const multi = redisClient.multi()
                for (const [type, count] of problem.reactionCounts.entries()) {
                    multi.zAdd(redisCountKey, { score: count, value: type })
                }
                await multi.exec()
                countsRaw = await redisClient.zRangeWithScores(redisCountKey, 0, -1)
            }
        }

        const counts = {}
        REACTION_TYPES.forEach((t) => (counts[t] = 0))
        countsRaw.forEach(({ value, score }) => {
            counts[value] = Math.max(0, score)
        })

        let userReaction = 'NONE'
        if (user) {
            const userId = user._id.toString()
            const redisUserKey = `user:${userId}:reacted:problem:${problemId}`
            userReaction = await redisClient.get(redisUserKey)
            if (userReaction === null) {
                await dbConnect()
                const reaction = await Reaction.findOne({ userId, problemId })
                userReaction = reaction ? reaction.type : 'NONE'
                await redisClient.set(redisUserKey, userReaction, { EX: 86400 })
            }
        }

        return NextResponse.json({
            success: true,
            counts,
            userReaction,
        })
    } catch (error) {
        console.error('Get Reactions Error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
