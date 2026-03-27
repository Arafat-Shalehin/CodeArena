'use client'

import { Button } from '@/components/ui/button'

/**
 * Global Error Boundary
 * Catch-all for unhandled errors in the application.
 */
export default function GlobalError({ error, reset }) {
    return (
        <html>
            <body className="bg-bg-page site-gradient flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-md space-y-6 text-center">
                    <div className="space-y-2">
                        <h2 className="font-display text-text-primary text-3xl font-bold">
                            Something went wrong!
                        </h2>
                        <p className="text-text-muted">
                            We apologize for the inconvenience. Our team has been notified.
                        </p>
                    </div>

                    <div className="bg-error-light text-error border-error/20 max-h-40 overflow-auto rounded-lg border p-4 text-left font-mono text-sm">
                        {error.message || 'Unknown error occurred'}
                    </div>

                    <Button onClick={() => reset()} className="w-full">
                        Try again
                    </Button>
                </div>
            </body>
        </html>
    )
}
