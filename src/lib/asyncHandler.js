import { getSafeLogger } from '@/lib/safe-logger'

/**
 * Async route handler wrapper with safe error logging
 *
 * Catches errors, logs them safely (DB fallback to console), and returns proper HTTP responses
 * Uses safe-logger to prevent logging failures from crashing the app
 */
export function asyncHandler(fn) {
    return async (req, context) => {
        try {
            return await fn(req, context)
        } catch (error) {
            const status = error.status || error.statusCode || 500

            // Only log genuine server errors (5xx) to prevent noise
            if (status >= 500) {
                const errorLogger = getSafeLogger('system')

                // Log error with safe logging (DB with console fallback)
                await errorLogger.error('Unhandled API error', {
                    status,
                    message: error.message,
                    url: req.url,
                    method: req.method,
                    stack: error.stack,
                    ...(error.code && { code: error.code }),
                })
            }

            return Response.json(
                {
                    success: false,
                    message: error.message || 'Internal Server Error',
                    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
                },
                { status }
            )
        }
    }
}
