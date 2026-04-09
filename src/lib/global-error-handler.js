/**
 * Global Error Handler
 *
 * Catches uncaught exceptions and unhandled rejections
 * Integrates with safe logging to prevent cascading failures
 *
 * Usage:
 *   import './lib/global-error-handler'  // Call in instrumentation.js
 */

import { getSafeLogger, isMongoDbReady } from '@/lib/safe-logger'
import mongoose from 'mongoose'

const errorLogger = getSafeLogger('system')

/**
 * Error context collector
 * Gathers context about error for better debugging
 */
function getErrorContext() {
    return {
        timestamp: new Date().toISOString(),
        dbConnected: isMongoDbReady(),
        dbState: mongoose.connection.readyState,
        nodeEnv: process.env.NODE_ENV,
        uptime: process.uptime(),
        memory: {
            rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
            heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
    }
}

/**
 * Format error for logging
 */
function formatError(error) {
    return {
        name: error.name || 'UnknownError',
        message: error.message || 'No message',
        stack: error.stack || 'No stack',
        ...(error.code && { code: error.code }),
        ...(error.statusCode && { statusCode: error.statusCode }),
    }
}

/**
 * Handle uncaught exceptions
 * These occur when a thrown error is not caught by any try-catch
 */
process.on('uncaughtException', async (error) => {
    console.error('🔴 UNCAUGHT EXCEPTION:', error.message)

    const context = getErrorContext()
    const formattedError = formatError(error)

    // Log to database via safe logger
    await errorLogger.error('Uncaught exception detected', {
        category: 'uncaughtException',
        error: formattedError,
        context,
    })

    // In production, give time for logs to flush before exit
    if (process.env.NODE_ENV === 'production') {
        console.error('⚠️  FATAL: Uncaught exception - shutting down gracefully')
        setTimeout(() => {
            process.exit(1)
        }, 1000)
    }
})

/**
 * Handle unhandled promise rejections
 * These occur when a Promise rejects without a .catch() handler
 */
process.on('unhandledRejection', async (reason, promise) => {
    console.error('🔴 UNHANDLED REJECTION:', reason)

    const context = getErrorContext()
    const formattedError =
        reason instanceof Error
            ? formatError(reason)
            : {
                  message: String(reason),
                  type: typeof reason,
              }

    // Log to database via safe logger
    await errorLogger.error('Unhandled promise rejection', {
        category: 'unhandledRejection',
        error: formattedError,
        promise: String(promise),
        context,
    })

    // In production, we may choose to exit (configurable)
    const exitOnRejection = process.env.EXIT_ON_UNHANDLED_REJECTION === 'true'
    if (exitOnRejection && process.env.NODE_ENV === 'production') {
        console.error('⚠️  FATAL: Unhandled rejection - shutting down gracefully')
        setTimeout(() => {
            process.exit(1)
        }, 1000)
    }
})

/**
 * Handle process warnings
 */
process.on('warning', (warning) => {
    console.warn('⚠️  PROCESS WARNING:', warning.name, warning.message)

    // Only log critical warnings to database
    if (warning.name === 'MaxListenersExceededWarning') {
        void errorLogger.warn('Process warning detected', {
            category: 'processWarning',
            warning: {
                name: warning.name,
                message: warning.message,
            },
        })
    }
})

/**
 * Graceful shutdown signal handlers
 * Coordinates with worker-manager and other cleanup
 */
const gracefulShutdownSignals = ['SIGTERM', 'SIGINT', 'SIGHUP']

gracefulShutdownSignals.forEach((signal) => {
    process.on(signal, async () => {
        console.log(`\n📢 Received ${signal} - initiating graceful shutdown`)

        // Log shutdown request
        await errorLogger.info(`Process received ${signal} signal`, {
            signal,
            context: getErrorContext(),
        })

        // Give worker-manager time to shut down
        // (worker-manager installs its own signal handlers)
        // This handler runs AFTER it completes
    })
})

/**
 * Export for manual error logging if needed
 */
export async function logError(message, error, category = 'manual') {
    const formattedError = error instanceof Error ? formatError(error) : { message: String(error) }

    await errorLogger.error(message, {
        category,
        error: formattedError,
        context: getErrorContext(),
    })
}

/**
 * Export health status of error handling
 */
export function getErrorHandlerStatus() {
    return {
        registered: true,
        handlers: ['uncaughtException', 'unhandledRejection', 'warning', 'signals'],
        context: getErrorContext(),
    }
}

export default {
    logError,
    getErrorHandlerStatus,
    getErrorContext,
}
