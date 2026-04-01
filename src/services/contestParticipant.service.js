import mongoose from 'mongoose'
import { ContestParticipant } from '@/models/ContestParticipant.models'
import { Contest } from '@/models/Contest.models'
import { User } from '@/models/User.models'
import { logger } from '@/lib/logger'

/**
 * Register a user for a contest
 */
export async function registerUserForContest(contestId, userId) {
    const contest = await Contest.findById(contestId)
    if (!contest) {
        const err = new Error('Contest not found.')
        err.status = 404
        throw err
    }

    const now = new Date()
    const startTime = new Date(contest.startTime)
    const gracePeriodEnd = new Date(startTime.getTime() + 10 * 60 * 1000) // 10 mins

    if (now > gracePeriodEnd && contest.status === 'active') {
        const err = new Error(
            'Entry to the contest is closed. The 10-minute grace period has expired.'
        )
        err.status = 403
        throw err
    }

    if (contest.status === 'completed') {
        logger.contest.warn('Registration attempt on completed contest.', {
            contestId,
            userId,
        })
        const err = new Error('Cannot register for a completed contest.')
        err.status = 400
        throw err
    }

    const existing = await ContestParticipant.findOne({ contestId, userId })
    if (existing) {
        logger.contest.info('Duplicate registration request handled gracefully.', {
            contestId,
            userId,
        })
        const participantObj = existing.toObject ? existing.toObject() : existing
        return { ...participantObj, alreadyRegistered: true }
    }

    const participant = await ContestParticipant.create({
        contestId,
        userId,
        score: 0,
        rank: 0,
        solvedProblemCount: 0,
        penalty: 0,
        solvedProblemIds: [],
    })

    logger.contest.info('User registered for contest.', {
        contestId,
        userId,
        participantId: participant._id,
    })

    return participant
}

/**
 * Get participants for a contest (Leaderboard)
 */
export async function getContestParticipants(contestId, query = {}) {
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 20
    const skip = (page - 1) * limit

    const participants = await ContestParticipant.find({ contestId })
        .populate('userId', 'name email stats')
        .sort({ score: -1, updatedAt: 1 })
        .skip(skip)
        .limit(limit)

    const total = await ContestParticipant.countDocuments({ contestId })

    return {
        participants,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    }
}

/**
 * Check if specific user is registered
 */
export async function getParticipantDetails(contestId, userId) {
    if (!mongoose.Types.ObjectId.isValid(contestId)) {
        throw new Error('Invalid contest ID.')
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID.')
    }

    const participant = await ContestParticipant.findOne({
        contestId,
        userId,
    })
        .populate('userId', 'name email stats')
        .lean()

    if (!participant) {
        throw new Error('Participant not found.')
    }

    return participant
}

/**
 * Update participant score (called after submission evaluation)
 * Handles atomic problem tracking, penalty calculation, and Redis rank sync.
 */
export async function updateParticipantScore(
    contestId,
    userId,
    { problemId, scoreIncrement, penaltyIncrement }
) {
    if (!mongoose.Types.ObjectId.isValid(contestId) || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid contest or user ID.')
    }

    // 1. Update MongoDB - Atomic check if problem already solved
    // We use $addToSet for solvedProblemIds and only increment score/count if it was added
    const participant = await ContestParticipant.findOneAndUpdate(
        {
            contestId,
            userId,
            solvedProblemIds: { $ne: problemId }, // Only update if problem NOT already solved
        },
        {
            $inc: {
                score: scoreIncrement || 0,
                penalty: penaltyIncrement || 0,
                solvedProblemCount: 1,
                submissions: 1,
            },
            $addToSet: { solvedProblemIds: problemId },
            $set: { lastSubmissionAt: new Date() },
        },
        { new: true }
    )

    // If participant is null, it means either:
    // a) Problem already solved (ignore update)
    // b) Participant doesn't exist (serious error)
    if (!participant) {
        const checkExists = await ContestParticipant.findOne({ contestId, userId }).lean()
        if (!checkExists) {
            throw new Error('Participant record not found.')
        }
        // Problem already solved, just return current state
        return checkExists
    }

    // 2. Sync with Redis Sorted Set for O(log N) ranking
    // Score in Redis: (score * 10^12) + (10^12 - penalty_seconds)
    // This allows ZREVRANGE to sort by high score then low penalty
    try {
        const { redisClient } = await import('@/lib/redis')
        if (redisClient.isOpen) {
            const redisScore = participant.score * 1e12 + (1e12 - participant.penalty)
            await redisClient.zAdd(`contest:${contestId}:leaderboard`, {
                score: redisScore,
                value: userId.toString(),
            })
        }
    } catch (err) {
        logger.contest.error('Failed to sync Redis leaderboard after score update', {
            contestId,
            userId,
            error: err.message,
        })
    }

    return participant
}

/**
 * Remove participant (admin use)
 */
export async function removeParticipant(contestId, userId) {
    if (!mongoose.Types.ObjectId.isValid(contestId)) {
        throw new Error('Invalid contest ID.')
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID.')
    }

    const deleted = await ContestParticipant.findOneAndDelete({
        contestId,
        userId,
    })

    if (!deleted) {
        throw new Error('Participant not found.')
    }

    return true
}

/**
 * Mark a contest as finished for a specific user
 */
export async function finishContestForUser(contestId, userId) {
    if (!mongoose.Types.ObjectId.isValid(contestId) || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid contest or user ID.')
    }

    const participant = await ContestParticipant.findOneAndUpdate(
        { contestId, userId },
        {
            $set: {
                isFinished: true,
                finishedAt: new Date(),
            },
        },
        { new: true }
    )

    if (!participant) {
        throw new Error('Participant not found.')
    }

    logger.contest.info('User finished contest early.', { contestId, userId })

    return participant
}
