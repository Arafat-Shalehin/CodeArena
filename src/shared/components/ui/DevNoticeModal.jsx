'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export default function DevNoticeModal() {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem('dev_notice_dismissed')
        if (stored === 'true') return

        const isDeployEnv =
            window.location.hostname.includes('vercel') ||
            window.location.hostname.includes('now.sh') ||
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            process.env.NEXT_PUBLIC_VERCEL_ENV

        if (!isDeployEnv) return

        const timer = setTimeout(() => setOpen(true), 600)
        return () => clearTimeout(timer)
    }, [])

    const dismiss = () => {
        setOpen(false)
        try {
            localStorage.setItem('dev_notice_dismissed', 'true')
        } catch {}
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-bg-page border-border mx-4 w-full max-w-md rounded-2xl border p-6 shadow-2xl">
                <div className="mb-4 flex items-start justify-between">
                    <h2 className="text-text-primary text-lg font-bold">Development Notice</h2>
                    <button
                        onClick={dismiss}
                        className="text-text-muted hover:text-text-primary rounded-lg p-1 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="text-text-secondary space-y-3 text-sm leading-relaxed">
                    <p>
                        This instance of CodeArena is running on{' '}
                        <span className="text-text-primary font-semibold">Vercel&apos;s free tier</span>{' '}
                        and is currently under active development.
                    </p>
                    <p>
                        As a result, certain features including real-time collaboration,
                        WebSocket connections, and code execution may be limited or behave
                        differently than they would in a full production environment.
                    </p>
                    <p>
                        We&apos;re working hard to bring the complete experience. Thank you for
                        your understanding and support.
                    </p>
                </div>

                <button
                    onClick={dismiss}
                    className="bg-accent hover:bg-accent/80 mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors"
                >
                    Got it
                </button>
            </div>
        </div>
    )
}
