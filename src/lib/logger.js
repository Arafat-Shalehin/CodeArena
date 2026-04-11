import { createLog } from '@/services/log.service'
import { safeLogToDb } from '@/lib/safe-logger'

/**
 * Internal safe logger wrapper
 * Delegates to safe-logger for advanced DB state checking and console fallback
 * Ensures logging failure never breaks application flow
 */
async function safeLog(payload) {
    // Use safe-logger's advanced implementation with DB state checking and rate limiting
    const { message, type, level, ...meta } = payload

    // Create a wrapper function that matches safe-logger's API
    const logFn = async (msg, metadata) => {
        await createLog({
            type,
            level,
            message: msg,
            ...metadata,
            ...meta,
        })
    }

    // Delegate to safe-logger's advanced version
    await safeLogToDb(logFn, message, meta)
}

/**
 * Factory to create log type helpers
 */
function createTypeLogger(type) {
    return {
        info: async (message, meta = {}) => safeLog({ type, level: 'info', message, ...meta }),

        warn: async (message, meta = {}) => safeLog({ type, level: 'warn', message, ...meta }),

        error: async (message, meta = {}) => safeLog({ type, level: 'error', message, ...meta }),
    }
}

/**
 * Centralized logger object
 */
export const logger = {
    system: createTypeLogger('SYSTEM'),
    auth: createTypeLogger('AUTH'),
    contest: createTypeLogger('CONTEST'),
    submission: createTypeLogger('SUBMISSION'),
    execution: createTypeLogger('EXECUTION'),
    security: createTypeLogger('SECURITY'),
    database: createTypeLogger('DATABASE'),
}
