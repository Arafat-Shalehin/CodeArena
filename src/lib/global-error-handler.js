/**
 * Global Error Handler
 *
 * Node-only process handlers with Edge-safe guards.
 */

import { getSafeLogger, isMongoDbReady } from '@/lib/safe-logger'
import mongoose from 'mongoose'

const errorLogger = getSafeLogger('system')

function getNodeProcess() {
    const proc = globalThis?.['process']
    if (!proc || !proc.versions || !proc.versions.node) {
        return null
    }
    return proc
}

function getEnv(name, fallback = '') {
    const proc = getNodeProcess()
    return proc?.env?.[name] ?? fallback
}

function collectErrorContext() {
    const proc = getNodeProcess()

    const context = {
        timestamp: new Date().toISOString(),
        dbConnected: isMongoDbReady(),
        dbState: mongoose.connection.readyState,
        nodeEnv: getEnv('NODE_ENV', 'unknown'),
        uptime: typeof proc?.uptime === 'function' ? proc.uptime() : 0,
        memory: {},
    }

    if (proc && typeof proc.memoryUsage === 'function') {
        const mem = proc.memoryUsage()
        context.memory = {
            rss: Math.round(mem.rss / 1024 / 1024),
            heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
            heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
        }
    }

    return context
}

function formatError(error) {
    return {
        name: error?.name || 'UnknownError',
        message: error?.message || 'No message',
        stack: error?.stack || 'No stack',
        ...(error?.code && { code: error.code }),
        ...(error?.statusCode && { statusCode: error.statusCode }),
    }
}

function registerNodeProcessHandlers() {
    const proc = getNodeProcess()
    if (!proc || typeof proc.on !== 'function') {
        return
    }

    proc.on('uncaughtException', async (error) => {
        console.error('UNCAUGHT EXCEPTION:', error?.message)

        await errorLogger.error('Uncaught exception detected', {
            category: 'uncaughtException',
            error: formatError(error),
            context: collectErrorContext(),
        })

        if (getEnv('NODE_ENV') === 'production' && typeof proc.exit === 'function') {
            console.error('FATAL: Uncaught exception - shutting down gracefully')
            setTimeout(() => proc.exit(1), 1000)
        }
    })

    proc.on('unhandledRejection', async (reason, promise) => {
        console.error('UNHANDLED REJECTION:', reason)

        const formattedError =
            reason instanceof Error
                ? formatError(reason)
                : {
                      message: String(reason),
                      type: typeof reason,
                  }

        await errorLogger.error('Unhandled promise rejection', {
            category: 'unhandledRejection',
            error: formattedError,
            promise: String(promise),
            context: collectErrorContext(),
        })

        const exitOnRejection = getEnv('EXIT_ON_UNHANDLED_REJECTION') === 'true'
        if (
            exitOnRejection &&
            getEnv('NODE_ENV') === 'production' &&
            typeof proc.exit === 'function'
        ) {
            console.error('FATAL: Unhandled rejection - shutting down gracefully')
            setTimeout(() => proc.exit(1), 1000)
        }
    })

    proc.on('warning', (warning) => {
        console.warn('PROCESS WARNING:', warning?.name, warning?.message)

        if (warning?.name === 'MaxListenersExceededWarning') {
            void errorLogger.warn('Process warning detected', {
                category: 'processWarning',
                warning: {
                    name: warning.name,
                    message: warning.message,
                },
            })
        }
    })
    ;['SIGTERM', 'SIGINT', 'SIGHUP'].forEach((signal) => {
        proc.on(signal, async () => {
            console.log(`\nReceived ${signal} - initiating graceful shutdown`)
            await errorLogger.info(`Process received ${signal} signal`, {
                signal,
                context: collectErrorContext(),
            })
        })
    })
}

registerNodeProcessHandlers()

export async function logError(message, error, category = 'manual') {
    const formattedError = error instanceof Error ? formatError(error) : { message: String(error) }

    await errorLogger.error(message, {
        category,
        error: formattedError,
        context: collectErrorContext(),
    })
}

export function getErrorContext() {
    return collectErrorContext()
}

export function getErrorHandlerStatus() {
    return {
        registered: true,
        handlers: ['uncaughtException', 'unhandledRejection', 'warning', 'signals'],
        context: collectErrorContext(),
    }
}

export default {
    logError,
    getErrorHandlerStatus,
    getErrorContext,
}
