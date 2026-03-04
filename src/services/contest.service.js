import { Contest } from '@/models/Contest.models'
import { logger } from '@/lib/logger'

/**
 * Helper to validate contest dates
 */
function validateDates(startTime, endTime) {
    if (new Date(startTime) >= new Date(endTime)) {
        const err = new Error('Start time must be before end time.')
        err.status = 400
        throw err
    }
}

/**
 * Create a new contest
 */
export async function createContest(data) {
    const { title, startTime, endTime } = data

    if (!title || !startTime || !endTime) {
        const err = new Error('Title, start time, and end time are required.')
        err.status = 400
        throw err
    }

    validateDates(startTime, endTime)

    // Automatically derive status based on start time
    const now = new Date()
    const status =
        now < new Date(startTime)
            ? 'upcoming'
            : now >= new Date(startTime) && now <= new Date(endTime)
              ? 'active'
              : 'completed'

    const contest = await Contest.create({
        ...data,
        status,
    })

    return contest
}

/**
 * Get all contests
 */
export async function getAllContests(query) {
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 10
    const skip = (page - 1) * limit

    const filter = { isDeleted: false }
    if (query.status) filter.status = query.status

    // FUTURE_ENHANCEMENT: Auto-update status before returning
    // Uncomment the block below to auto-sync contest status on read.
    // This works for low-traffic scenarios but should be replaced with
    // a cron job (e.g., via Vercel Cron or a background worker) in production.
    //
    // await Contest.updateMany(
    //   { startTime: { $lte: new Date() }, status: 'upcoming' },
    //   { status: 'active' }
    // );
    // await Contest.updateMany(
    //   { endTime: { $lte: new Date() }, status: 'active' },
    //   { status: 'completed' }
    // );

    const contests = await Contest.find(filter)
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean() // lean() for performance

    const total = await Contest.countDocuments(filter)

    return {
        contests,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    }
}

/**
 * Get contest by ID
 */
export async function getContestById(id, options = { problemLimit: 50, isAdmin: false }) {
    const contest = await Contest.findOne({ _id: id, isDeleted: false })

    if (!contest) {
        const err = new Error('Contest not found.')
        err.status = 404
        throw err
    }

    // UPDATED LOGIC: Populate if it's completed OR if the requester is an admin
    const shouldPopulate = contest.status === 'completed' || options.isAdmin

    if (shouldPopulate && contest.problemIds.length > 0) {
        await contest.populate({
            path: 'problemIds',
            select: 'title difficulty',
            // Use the limit from options
            options: { limit: options.problemLimit },
        })
    }

    return contest
}

/**
 * Update contest
 */
export async function updateContest(id, data) {
    if (data.startTime && data.endTime) {
        validateDates(data.startTime, data.endTime)
    }

    const contest = await Contest.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    })

    if (!contest) {
        const err = new Error('Contest not found.')
        err.status = 404
        throw err
    }

    await logger.contest.info('Contest updated.', {
        contestId: contest._id,
        updatedFields: Object.keys(data),
    })

    return contest
}

/**
 * Delete contest
 */
export async function deleteContest(id) {
    const contest = await Contest.findByIdAndUpdate(id, { isDeleted: true }, { new: true })

    if (!contest) {
        const err = new Error('Contest not found.')
        err.status = 404
        throw err
    }

    await logger.contest.warn('Contest deleted.', {
        contestId: contest._id,
        title: contest.title,
    })

    return contest
}
