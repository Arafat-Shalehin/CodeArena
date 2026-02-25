import mongoose from 'mongoose'
import { ContestParticipant } from '@/models/ContestParticipant.models'
import { Contest } from '@/models/Contest.models'
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

    if (contest.status === 'completed') {
        await logger.contest.warn('Registration attempt on completed contest.', {
            contestId,
            userId,
        })
        const err = new Error('Cannot register for a completed contest.')
        err.status = 400
        throw err
    }

    const existing = await ContestParticipant.findOne({ contestId, userId })
    if (existing) {
        await logger.contest.warn('Duplicate registration attempt.', {
            contestId,
            userId,
        })
        const err = new Error('User already registered for this contest.')
        err.status = 409
        throw err
    }

    const participant = await ContestParticipant.create({
        contestId,
        userId,
        score: 0,
        rank: 0,
    })

    await logger.contest.info('User registered for contest.', {
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
 */
export async function updateParticipantScore(contestId, userId, scoreIncrement) {
    if (!mongoose.Types.ObjectId.isValid(contestId)) {
        throw new Error('Invalid contest ID.')
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID.')
    }

    if (typeof scoreIncrement !== 'number') {
        throw new Error('Score increment must be a number.')
    }

    const participant = await ContestParticipant.findOneAndUpdate(
        { contestId, userId },
        { $inc: { score: scoreIncrement } },
        { new: true }
    )

    if (!participant) {
        throw new Error('Participant not found.')
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
