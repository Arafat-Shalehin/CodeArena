/**
 * Logging Utility for CodeArena
 *
 * Provides a centralized logging system with environment-aware output.
 * In production, logs are suppressed except for errors.
 * In development, all logs are shown with nice formatting.
 *
 * @example
 * import { logger } from '@/lib/logger'
 *
 * logger.info('User logged in', { userId: 123 })
 * logger.error('API call failed', error, { endpoint: '/api/users' })
 * logger.warn('Deprecated function called', { functionName: 'oldMethod' })
 * logger.debug('Debug info', { state })
 */

const isDev = process.env.NODE_ENV === 'development'

/**
 * Get a timestamp string for logs
 */
const getTimestamp = () => {
    return new Date().toISOString().split('T').join(' ').slice(0, -5)
}

/**
 * Get the log prefix with timestamp and level
 */
const getPrefix = (level, module) => {
    const timestamp = getTimestamp()
    const moduleTag = module ? `[${module}]` : ''

    if (isDev) {
        return `[${timestamp}] ${level}${moduleTag}:`
    }

    return `[CodeArena]${moduleTag}`
}

/**
 * Logger class with different log levels
 */
class Logger {
    constructor(module) {
        this.module = module
    }

    /**
     * Info logs - General information
     * Production: ❌ Hidden | Development: ✅ Shown
     */
    info(message, ...data) {
        if (isDev) {
            console.log(getPrefix('INFO', this.module), message, ...data)
        }
    }

    /**
     * Success logs - Operation completed successfully
     * Production: ❌ Hidden | Development: ✅ Shown
     */
    success(message, ...data) {
        if (isDev) {
            console.log(getPrefix('✅ SUCCESS', this.module), message, ...data)
        }
    }

    /**
     * Debug logs - Detailed debugging information
     * Production: ❌ Hidden | Development: ✅ Shown (only when DEBUG=true)
     */
    debug(message, ...data) {
        if (isDev && process.env.NEXT_PUBLIC_DEBUG === 'true') {
            console.debug(getPrefix('🐛 DEBUG', this.module), message, ...data)
        }
    }

    /**
     * Warning logs - Something might be wrong
     * Production: ⚠️ Shown | Development: ✅ Shown
     */
    warn(message, ...data) {
        console.warn(getPrefix('⚠️ WARN', this.module), message, ...data)
    }

    /**
     * Error logs - Something went wrong
     * Production: ❌ Shown | Development: ✅ Shown
     */
    error(message, error, ...data) {
        console.error(getPrefix('❌ ERROR', this.module), message, error, ...data)

        // In production, you might want to send errors to a monitoring service
        if (!isDev && typeof window !== 'undefined') {
            // TODO: Integrate with error monitoring service (Sentry, LogRocket, etc.)
            // Example: Sentry.captureException(error, { tags: { module: this.module } })
        }
    }

    /**
     * Group logs - Group related logs together
     */
    group(label, callback) {
        if (isDev) {
            console.group(getPrefix('GROUP', this.module), label)
            callback()
            console.groupEnd()
        } else {
            callback()
        }
    }

    /**
     * Time logs - Measure execution time
     */
    time(label) {
        if (isDev) {
            console.time(`${getPrefix('TIME', this.module)} ${label}`)
        }
    }

    /**
     * Time end logs - End timing measurement
     */
    timeEnd(label) {
        if (isDev) {
            console.timeEnd(`${getPrefix('TIME', this.module)} ${label}`)
        }
    }

    /**
     * Create a child logger with a specific module name
     */
    child(module) {
        return new Logger(`${this.module}:${module}`)
    }
}

/**
 * Create a root logger instance
 */
const createLogger = (module = 'App') => {
    return new Logger(module)
}

/**
 * Root logger for general use
 */
export const logger = createLogger()

/**
 * Pre-configured loggers for common modules
 */
export const loggers = {
    auth: createLogger('Auth'),
    api: createLogger('API'),
    socket: createLogger('Socket'),
    editor: createLogger('Editor'),
    contest: createLogger('Contest'),
    interview: createLogger('Interview'),
    profile: createLogger('Profile'),
    problem: createLogger('Problem'),
    submission: createLogger('Submission'),
}

export default createLogger
