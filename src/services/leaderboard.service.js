import mongoose from 'mongoose'
import { redisClient } from '@/lib/redis'
import { Leaderboard } from '@/models/Leaderboard.models'
import { Contest } from '@/models/Contest.models'
import { ContestParticipant } from '@/models/ContestParticipant.models'

/**
 * Compute & finalize leaderboard for a contest
 * - Only allowed when contest is completed
 * - Runs inside a transaction
 * - Idempotent (will not duplicate entries)
 */
export async function computeLeaderboard(contestId) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const contest = await Contest.findById(contestId).session(session)

        if (!contest) {
            const err = new Error('Contest not found.')
            err.status = 404
            throw err
        }
        if (contest.status !== 'completed') {
            const err = new Error('Leaderboard can only be computed after contest completion.')
            err.status = 400
            throw err
        }

        // Prevent recomputation if already finalized
        const alreadyExists = await Leaderboard.exists({ contestId })
        if (alreadyExists) {
            const err = new Error('Leaderboard already finalized for this contest.')
            err.status = 409
            throw err
        }

        // Fetch participants sorted by scoring logic
        const participants = await ContestParticipant.find({ contestId })
            .sort({
                score: -1,
                penalty: 1, // lower penalty wins (if exists)
                lastSubmissionAt: 1, // earlier submission wins
            })
            .session(session)

        if (!participants.length) {
            throw new Error('No participants found for this contest.')
        }

        let currentRank = 1
        let previousScore = null
        let previousPenalty = null

        const bulkOps = []

        participants.forEach((p, index) => {
            // Tie handling (same score + penalty)
            if (
                previousScore !== null &&
                (p.score !== previousScore || p.penalty !== previousPenalty)
            ) {
                currentRank = index + 1
            }

            bulkOps.push({
                insertOne: {
                    document: {
                        contestId,
                        userId: p.userId,
                        score: p.score,
                        rank: currentRank,
                        submissions: p.submissions || 0,
                        penalty: p.penalty || 0,
                        lastSubmissionAt: p.lastSubmissionAt || null,
                        finalized: true,
                    },
                },
            })

            previousScore = p.score
            previousPenalty = p.penalty
        })

        if (bulkOps.length) {
            await Leaderboard.bulkWrite(bulkOps, { session })
        }

        await session.commitTransaction()
        session.endSession()

        // Invalidate leaderboard cache
        try {
            if (redisClient.isOpen) {
                const keys = await redisClient.keys(`leaderboard:${contestId}:*`)
                if (keys.length) await redisClient.del(keys)
            }
        } catch (err) {
            console.error('Failed to clear leaderboard cache after compute:', err)
        }

        return {
            success: true,
            totalParticipants: participants.length,
        }
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }
}

/**
 * Get leaderboard (paginated)
 * Optimized for read-heavy workloads
 */
export async function getLeaderboard(contestId, query = {}) {
    console.log('contestId:', contestId)
    const page = Math.max(parseInt(query.page) || 1, 1)
    const limit = Math.min(parseInt(query.limit) || 20, 100)
    const skip = (page - 1) * limit

    const cacheKey = `leaderboard:${contestId}:page:${page}:limit:${limit}`

    // Try cache first
    try {
        if (redisClient.isOpen) {
            const cached = await redisClient.get(cacheKey)
            if (cached) {
                return JSON.parse(cached)
            }
        }
    } catch (err) {
        console.error('Redis read failed, continuing without cache')
    }

    const filter = { contestId }

    const leaderboard = await Leaderboard.find(filter)
        .populate('userId', 'name email stats')
        .sort({ rank: 1 })
        .skip(skip)
        .limit(limit)
        .lean()

    const total = await Leaderboard.countDocuments(filter)

    const result = {
        leaderboard,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    }

    // Store in cache (60 seconds TTL)
    try {
        if (redisClient.isOpen) {
            await redisClient.set(cacheKey, JSON.stringify(result), { EX: 60 })
        }
    } catch (err) {
        console.error('Redis write failed')
    }

    return result
}

/**
 * Get single user's rank in contest
 * O(log n) due to index on (contestId, userId)
 */
export async function getUserRank(contestId, userId) {
    const entry = await Leaderboard.findOne({ contestId, userId })
        .select('rank score penalty submissions')
        .lean()

    if (!entry) {
        throw new Error('User not found in leaderboard.')
    }

    return entry
}

/**
 * Delete leaderboard (admin use only)
 * Used if contest needs re-evaluation
 */
export async function resetLeaderboard(contestId) {
    const result = await Leaderboard.deleteMany({ contestId })
    try {
        if (redisClient.isOpen) {
            const keys = await redisClient.keys(`leaderboard:${contestId}:*`)
            if (keys.length) {
                await redisClient.del(keys)
            }
        }
    } catch (err) {
        console.error('Failed to clear leaderboard cache')
    }

    return {
        deletedEntries: result.deletedCount,
    }
}
