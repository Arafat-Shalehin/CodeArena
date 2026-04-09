/**
 * Safe Logging System
 * Prevents database dependency crashes during logging
 *
 * Problem: When MongoDB is down, logging to DB blocks/crashes the app
 * Solution: Check DB state before attempting write, fallback to console
 *
 * Usage:
 *   import { safeLogToDb, getSafeLogger } from '@/lib/safe-logger'
 *
 *   // Direct logging
 *   await safeLogToDb(logger.system.error, 'Failed request', { error })
 *
 *   // Or use safe logger wrapper
 *   const safe = getSafeLogger('submission')
 *   await safe.error('Submission failed', { submissionId })
 */

import mongoose from 'mongoose'

/**
 * Rate limiter for console fallback (prevents spam)
 * Tracks last log time per type to rate-limit console output
 */
class ConsoleFallbackRateLimiter {
    constructor(maxLogsPerType = 10, windowMs = 60000) {
        this.logCounts = new Map()
        this.maxLogsPerType = maxLogsPerType
        this.windowMs = windowMs
    }

    canLog(type) {
        const now = Date.now()
        const key = type

        if (!this.logCounts.has(key)) {
            this.logCounts.set(key, { count: 1, resetTime: now + this.windowMs })
            return true
        }

        const entry = this.logCounts.get(key)

        // Reset window if time has passed
        if (now > entry.resetTime) {
            entry.count = 1
            entry.resetTime = now + this.windowMs
            return true
        }

        // Check if within limit
        if (entry.count < this.maxLogsPerType) {
            entry.count++
            return true
        }

        return false
    }

    reset() {
        this.logCounts.clear()
    }
}

const rateLimiter = new ConsoleFallbackRateLimiter()

/**
 * Check if MongoDB is ready for writes
 * @returns {boolean}
 */
export function isMongoDbReady() {
    return mongoose.connection.readyState === 1
}

/**
 * Get MongoDB connection state description
 * @returns {string}
 */
export function getDbState() {
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    }
    return states[mongoose.connection.readyState] || 'unknown'
}

/**
 * Safely log to database with console fallback
 * Never throws - always returns result
 *
 * @param {Function} logFn - Logger function (e.g., logger.system.error)
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @returns {Promise<{success: boolean, method: 'db'|'console', error?: string}>}
 */
export async function safeLogToDb(logFn, message, meta = {}) {
    // If DB is ready, attempt database write
    if (isMongoDbReady()) {
        try {
            await logFn(message, meta)
            return { success: true, method: 'db' }
        } catch (dbError) {
            // DB write failed - fall through to console
            const fallbackMessage = `[LOG FALLBACK] DB write failed: ${dbError.message}`

            // Try console fallback
            const consoleResult = consoleLogWithRateLimit(message, meta, 'error')

            return {
                success: false,
                method: 'console',
                error: `DB write failed: ${dbError.message}`,
                fallbackUsed: true,
                consoleResult,
            }
        }
    }

    // DB not ready - use console fallback immediately
    const dbState = getDbState()
    const consoleResult = consoleLogWithRateLimit(message, { ...meta, dbState }, 'warn')

    return {
        success: false,
        method: 'console',
        reason: `DB not ready (${dbState})`,
        fallbackUsed: true,
        consoleResult,
    }
}

/**
 * Console fallback with rate limiting
 * Prevents console spam when DB is repeatedly down
 *
 * @param {string} message - Log message
 * @param {Object} meta - Metadata
 * @param {'log'|'warn'|'error'} level - Console level
 * @returns {Object}
 */
function consoleLogWithRateLimit(message, meta, level = 'log') {
    const type = `${level}:${message.substring(0, 20)}`

    if (!rateLimiter.canLog(type)) {
        return {
            logged: false,
            reason: 'rate_limited',
            message: `[RATE LIMITED] ${message}`,
        }
    }

    const timestamp = new Date().toISOString()
    const consoleMethod =
        level === 'error' ? console.error : level === 'warn' ? console.warn : console.log

    consoleMethod(`[${timestamp}] [CONSOLE FALLBACK]`, message, meta)

    return {
        logged: true,
        timestamp,
        message,
    }
}

/**
 * Create a safe logger wrapper for a specific type
 * Automatically checks DB state and falls back to console
 *
 * @param {string} type - Logger type ('system', 'auth', 'submission', etc.)
 * @returns {Object} - Safe logger with info/warn/error methods
 *
 * Usage:
 *   const safeLogger = getSafeLogger('submission')
 *   await safeLogger.error('Processing failed', { submissionId: '123' })
 */
export function getSafeLogger(type) {
    // Import logger lazily to avoid circular deps
    const loggerPromise = import('@/lib/logger').then((m) => m.logger)

    return {
        /**
         * Info level log with DB/console fallback
         */
        async info(message, meta = {}) {
            try {
                const logger = await loggerPromise
                const typeLogger = logger[type] || logger.system
                return await safeLogToDb(typeLogger.info.bind(typeLogger), message, meta)
            } catch (err) {
                console.log(`[INFO FALLBACK] ${message}`, meta)
                return { success: false, method: 'emergency_console', error: err.message }
            }
        },

        /**
         * Warning level log with DB/console fallback
         */
        async warn(message, meta = {}) {
            try {
                const logger = await loggerPromise
                const typeLogger = logger[type] || logger.system
                return await safeLogToDb(typeLogger.warn.bind(typeLogger), message, meta)
            } catch (err) {
                console.warn(`[WARN FALLBACK] ${message}`, meta)
                return { success: false, method: 'emergency_console', error: err.message }
            }
        },

        /**
         * Error level log with DB/console fallback
         */
        async error(message, meta = {}) {
            try {
                const logger = await loggerPromise
                const typeLogger = logger[type] || logger.system
                return await safeLogToDb(typeLogger.error.bind(typeLogger), message, meta)
            } catch (err) {
                console.error(`[ERROR FALLBACK] ${message}`, meta)
                return { success: false, method: 'emergency_console', error: err.message }
            }
        },
    }
}

/**
 * Check and report logging health
 * Useful for debugging logging failures
 *
 * @returns {Object}
 */
export function getLoggingHealth() {
    return {
        dbConnected: isMongoDbReady(),
        dbState: getDbState(),
        timestamp: new Date().toISOString(),
    }
}

/**
 * Reset rate limiter (testing only)
 */
export function resetRateLimiter() {
    rateLimiter.reset()
}

export default {
    safeLogToDb,
    getSafeLogger,
    isMongoDbReady,
    getDbState,
    getLoggingHealth,
    resetRateLimiter,
}
