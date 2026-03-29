'use client'

import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

const CHUNK_RELOAD_ONCE_KEY = 'codearena_chunk_reload_once'

function isChunkLoadError(error) {
    const message = String(error?.message || '')
    return (
        message.includes('ChunkLoadError') ||
        message.includes('Loading chunk') ||
        message.includes('Failed to load chunk') ||
        message.includes('/_next/static/chunks/')
    )
}

/**
 * Global Error Boundary
 * Catch-all for unhandled errors in the application.
 */
export default function GlobalError({ error, reset }) {
    const chunkError = isChunkLoadError(error)

    useEffect(() => {
        if (!chunkError || typeof window === 'undefined') return

        const alreadyReloaded = sessionStorage.getItem(CHUNK_RELOAD_ONCE_KEY) === '1'
        if (alreadyReloaded) return

        sessionStorage.setItem(CHUNK_RELOAD_ONCE_KEY, '1')
        window.location.reload()
    }, [chunkError])

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

                    <Button
                        onClick={() => {
                            if (chunkError && typeof window !== 'undefined') {
                                sessionStorage.removeItem(CHUNK_RELOAD_ONCE_KEY)
                                window.location.reload()
                                return
                            }
                            reset()
                        }}
                        className="w-full"
                    >
                        Try again
                    </Button>
                </div>
            </body>
        </html>
    )
}
