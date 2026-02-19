import mongoose from "mongoose";
import { Log } from "@/models/log.model";

/**
 * Allowed log types for consistency.
 * Extend this list if needed.
 */
export const LOG_TYPES = {
    ERROR: "error",
    INFO: "info",
    WARNING: "warning",
    AUTH: "auth",
    SUBMISSION: "submission",
    CONTEST: "contest",
    SYSTEM: "system",
};

/**
 * Create a new log entry
 * @param {Object} payload
 * @param {string} payload.type - log category
 * @param {string} payload.message - log message
 * @param {Object} [payload.meta] - optional metadata
 */
export async function createLog({ type, message, meta = {} }) {
    if (!type || !message) {
        throw new Error("Log type and message are required.");
    }

    const log = await Log.create({
        type,
        message,
        meta,
    });

    return log;
}

/**
 * Convenience method for error logging
 */
export async function logError(message, meta = {}) {
    return createLog({
        type: LOG_TYPES.ERROR,
        message,
        meta,
    });
}

/**
 * Fetch logs with filters & pagination
 * @param {Object} filters
 * @param {string} [filters.type]
 * @param {Date} [filters.from]
 * @param {Date} [filters.to]
 * @param {number} [page=1]
 * @param {number} [limit=20]
 */
export async function getLogs({
    type,
    from,
    to,
    page = 1,
    limit = 20,
}) {
    const query = {};

    if (type) {
        query.type = type;
    }

    if (from || to) {
        query.createdAt = {};
        if (from) query.createdAt.$gte = new Date(from);
        if (to) query.createdAt.$lte = new Date(to);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
        Log.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Log.countDocuments(query),
    ]);

    return {
        logs,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    };
}

/**
 * Delete logs older than X days
 * Useful for cleanup cron jobs
 */
export async function deleteOldLogs(days = 15) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await Log.deleteMany({
        createdAt: { $lt: cutoffDate },
    });

    return result.deletedCount;
}
