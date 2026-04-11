import { Contest } from '@/models/Contest.models'
import { ContestParticipant } from '@/models/ContestParticipant.models'
import { logger } from '@/lib/logger'
import { redisClient } from '@/lib/redis'

const CONTEST_LIST_VERSION_KEY = 'contest:list:v'

async function getContestListCacheVersion() {
    if (!redisClient.isOpen) return '1'
    try {
        return (await redisClient.get(CONTEST_LIST_VERSION_KEY)) || '1'
    } catch (err) {
        console.error('Redis read error in getContestListCacheVersion:', err)
        return '1'
    }
}

async function invalidateContestListCache() {
    if (!redisClient.isOpen) return
    try {
        await redisClient.incr(CONTEST_LIST_VERSION_KEY)
    } catch (err) {
        console.error('Redis invalidation error in invalidateContestListCache:', err)
    }
}

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

    await invalidateContestListCache()

    return contest
}

/**
 * Get all contests
 */
export async function getAllContests(query) {
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 10
    const skip = (page - 1) * limit

    const listVersion = await getContestListCacheVersion()
    const cacheKey = `contest:list:v:${listVersion}:p:${page}:l:${limit}:s:${query.status || 'all'}`

    try {
        if (redisClient.isOpen) {
            const cached = await redisClient.get(cacheKey)
            if (cached) {
                console.log(`[Cache Hit] Contest list: ${cacheKey}`)
                return JSON.parse(cached)
            }
        }
    } catch (err) {
        console.error('Redis read error in getAllContests:', err)
    }

    const filter = { isDeleted: false }
    if (query.status) filter.status = query.status

    const contests = (
        await Contest.find(filter).sort({ startTime: -1 }).skip(skip).limit(limit).lean()
    ).map((c, i) => ({
        ...c,
        // Assign a difficulty for filtering purposes if not present
        difficulty: c.difficulty || (i % 3 === 0 ? 'Easy' : i % 3 === 1 ? 'Medium' : 'Hard'),
    }))

    const total = await Contest.countDocuments(filter)

    const result = {
        contests,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    }

    try {
        if (redisClient.isOpen) {
            // Cache for 2 minutes
            await redisClient.set(cacheKey, JSON.stringify(result), { EX: 120 })
        }
    } catch (err) {
        console.error('Redis write error in getAllContests:', err)
    }

    return result
}

/**
 * Get contest by ID
 */
export async function getContestById(id, options = { problemLimit: 50, isAdmin: false }) {
    // Only cache if it's a standard public request
    const isStandardRequest = !options.isAdmin && options.problemLimit === 50
    const cacheKey = isStandardRequest ? `contest:${id}:detail` : null

    if (cacheKey) {
        try {
            if (redisClient.isOpen) {
                const cached = await redisClient.get(cacheKey)
                if (cached) {
                    console.log(`[Cache Hit] Contest detail: ${id}`)
                    return JSON.parse(cached)
                }
            }
        } catch (err) {
            console.error('Redis read error in getContestById:', err)
        }
    }

    const contest = await Contest.findOne({ _id: id, isDeleted: false })
        .populate({
            path: 'problemIds',
            select: 'title difficulty',
            options: { limit: options.problemLimit },
        })
        .lean()

    if (!contest) {
        const err = new Error('Contest not found.')
        err.status = 404
        throw err
    }

    // Add participantsCount
    const participantsCount = await ContestParticipant.countDocuments({ contestId: id })
    const result = { ...contest, participantsCount }

    if (cacheKey) {
        try {
            if (redisClient.isOpen) {
                // Cache for 5 minutes
                await redisClient.set(cacheKey, JSON.stringify(result), { EX: 300 })
            }
        } catch (err) {
            console.error('Redis write error in getContestById:', err)
        }
    }

    return result
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

    await invalidateContestListCache()
    if (redisClient.isOpen) {
        await redisClient.del(`contest:${id}:detail`).catch(() => {})

        // Publish update event for real-time synchronization
        await redisClient
            .publish(
                'contest_updates',
                JSON.stringify({
                    type: 'contest:updated',
                    contestId: id.toString(),
                })
            )
            .catch((err) => console.error('[CONTEST SERVICE] Redis publish error:', err))
    }

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

    await invalidateContestListCache()
    if (redisClient.isOpen) {
        await redisClient.del(`contest:${id}:detail`).catch(() => {})

        // Publish update event so clients can redirect or update
        await redisClient
            .publish(
                'contest_updates',
                JSON.stringify({
                    type: 'contest:deleted',
                    contestId: id.toString(),
                })
            )
            .catch((err) => console.error('[CONTEST SERVICE] Redis publish error (delete):', err))
    }

    return contest
}
