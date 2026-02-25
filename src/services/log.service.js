import { Log } from '@/models/Log.models'

/**
 * Create a log entry
 * Used internally across services/controllers
 */
export async function createLog({
    type,
    level = 'info',
    message,
    meta = {},
    userId = null,
    contestId = null,
    submissionId = null,
    ipAddress = null,
    requestId = null,
}) {
    if (!type || !level || !message) {
        throw new Error('type, level and message are required to create a log.')
    }

    return Log.create({
        type,
        level,
        message,
        meta,
        userId,
        contestId,
        submissionId,
        ipAddress,
        requestId,
    })
}

/**
 * Get logs with filtering & pagination
 * Used for Admin dashboard
 */
export async function getLogs(query = {}) {
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 20
    const skip = (page - 1) * limit

    const filter = {}

    if (query.type) {
        filter.type = query.type
    }

    if (query.level) {
        filter.level = query.level
    }

    if (query.userId) {
        filter.userId = query.userId
    }

    if (query.contestId) {
        filter.contestId = query.contestId
    }

    if (query.submissionId) {
        filter.submissionId = query.submissionId
    }

    if (query.from || query.to) {
        filter.createdAt = {}
        if (query.from) {
            filter.createdAt.$gte = new Date(query.from)
        }
        if (query.to) {
            filter.createdAt.$lte = new Date(query.to)
        }
    }

    const logs = await Log.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    const total = await Log.countDocuments(filter)

    return {
        logs,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    }
}

/**
 * Get single log by ID
 */
export async function getLogById(id) {
    const log = await Log.findById(id)

    if (!log) {
        throw new Error('Log not found.')
    }

    return log
}

/**
 * Delete log (admin maintenance use-case)
 */
export async function deleteLog(id) {
    const log = await Log.findByIdAndDelete(id)

    if (!log) {
        throw new Error('Log not found.')
    }

    return log
}
