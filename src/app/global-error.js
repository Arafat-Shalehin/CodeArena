'use client';


import { Button } from '@/components/ui/button';

/**
 * Global Error Boundary
 * Catch-all for unhandled errors in the application.
 */
export default function GlobalError({ error, reset }) {
    return (
        <html>
            <body className="min-h-screen bg-bg-page flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-display font-bold text-text-primary">
                            Something went wrong!
                        </h2>
                        <p className="text-text-muted">
                            We apologize for the inconvenience. Our team has been notified.
                        </p>
                    </div>

                    <div className="p-4 bg-error-light text-error rounded-lg text-sm font-mono text-left overflow-auto max-h-40 border border-error/20">
                        {error.message || "Unknown error occurred"}
                    </div>

                    <Button
                        onClick={() => reset()}
                        className="w-full"
                    >
                        Try again
                    </Button>
                </div>
            </body>
        </html>
    );
}
