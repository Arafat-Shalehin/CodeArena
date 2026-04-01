import mongoose from 'mongoose'
import { redisClient } from '@/lib/redis'
import { Leaderboard } from '@/models/Leaderboard.models'
import { Contest } from '@/models/Contest.models'
import { ContestParticipant } from '@/models/ContestParticipant.models'
import { Submission } from '@/models/Submission.models'

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
                        solvedProblemCount: p.solvedProblemCount || p.solvedProblemIds?.length || 0,
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
        leaderboard: leaderboard.map((entry) => ({
            ...entry,
            solvedProblemCount: entry.solvedProblemCount || 0,
        })),
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
 * Optimized: Uses Redis ZREVRANK (O(log N)) or fallback to DB
 */
export async function getUserRank(contestId, userId) {
    // 1. Try Redis for instant rank
    try {
        const { redisClient } = await import('@/lib/redis')
        if (redisClient.isOpen) {
            const rankZeroBased = await redisClient.zRevRank(
                `contest:${contestId}:leaderboard`,
                userId.toString()
            )
            if (rankZeroBased !== null) {
                const entry = await ContestParticipant.findOne({ contestId, userId })
                    .select('score penalty submissions solvedProblemCount solvedProblemIds')
                    .lean()

                return {
                    rank: rankZeroBased + 1,
                    score: entry?.score || 0,
                    penalty: entry?.penalty || 0,
                    submissions: entry?.submissions || 0,
                    solvedProblemCount:
                        entry?.solvedProblemCount || entry?.solvedProblemIds?.length || 0,
                }
            }
        }
    } catch (err) {
        console.error('Redis rank lookup failed, falling back to DB:', err)
    }

    // 2. Fallback to Finalized Leaderboard
    const finalizedEntry = await Leaderboard.findOne({ contestId, userId })
        .select('rank score penalty submissions solvedProblemCount finalized')
        .lean()

    if (finalizedEntry) return finalizedEntry

    // 3. Last Fallback: Compute from ContestParticipant (O(N) - avoid in production)
    const participant = await ContestParticipant.findOne({ contestId, userId }).lean()
    if (!participant) {
        throw new Error('User not found in contest.')
    }

    const higherRankCount = await ContestParticipant.countDocuments({
        contestId,
        $or: [
            { score: { $gt: participant.score } },
            { score: participant.score, penalty: { $lt: participant.penalty } },
        ],
    })

    return {
        rank: higherRankCount + 1,
        score: participant.score,
        penalty: participant.penalty,
        submissions: participant.submissions,
        solvedProblemCount:
            participant.solvedProblemCount || participant.solvedProblemIds?.length || 0,
        preliminary: true,
    }
}

/**
 * Get full contest summary for a user.
 * Includes pending submission detection to prevent race conditions
 * where a user finishes the contest before async workers complete.
 */
export async function getContestSummary(contestId, userId) {
    const [contest, result, totalParticipants, pendingCount] = await Promise.all([
        Contest.findById(contestId)
            .select('title startTime endTime problemIds isResultReady')
            .lean(),
        getUserRank(contestId, userId),
        ContestParticipant.countDocuments({ contestId }),
        // Count submissions still being processed by BullMQ workers
        Submission.countDocuments({
            contestId,
            userId,
            type: 'submit',
            status: { $in: ['queued', 'running'] },
        }),
    ])

    if (!contest) throw new Error('Contest not found.')

    const hasPendingSubmissions = pendingCount > 0
    // Result is consistent only when no submissions are in-flight
    const isResultConsistent = !hasPendingSubmissions

    return {
        contestTitle: contest.title,
        rank: result.rank,
        score: result.score,
        penalty: result.penalty,
        solvedCount: result.solvedProblemCount || 0,
        totalProblems: contest.problemIds.length,
        totalParticipants,
        isFinal: contest.isResultReady || false,
        startTime: contest.startTime,
        endTime: contest.endTime,
        // Race condition prevention flags
        hasPendingSubmissions,
        pendingCount,
        isResultConsistent,
    }
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
