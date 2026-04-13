'use client'

import { useState, useEffect } from 'react'

export function HostingAlert() {
    const [isVisible, setIsVisible] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const hasSeenAlert = sessionStorage.getItem('hasSeenHostingAlert')
        if (!hasSeenAlert) {
            // Add a small delay for better UX
            const timer = setTimeout(() => {
                setIsVisible(true)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleDismiss = () => {
        sessionStorage.setItem('hasSeenHostingAlert', 'true')
        setIsVisible(false)
    }

    if (!mounted || !isVisible) return null

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-opacity">
            <div className="bg-bg-page border-border animate-fade-up relative w-full max-w-md rounded-xl border p-6 shadow-2xl">
                <div className="flex items-start gap-4">
                    <div className="bg-accent/10 animate-soft-pulse mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                        <svg
                            className="text-accent h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-text-primary mb-2 text-xl font-semibold">
                            Hosting Notice
                        </h3>
                        <p className="text-text-secondary mb-6 text-sm leading-relaxed">
                            Welcome to CodeArena! We have recently migrated to a free hosting tier
                            on Vercel. Due to platform limitations, some features may experience
                            degraded performance or be temporarily unavailable. We apologize for any
                            inconvenience and appreciate your understanding.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button onClick={handleDismiss} className="btn-primary w-full px-8 sm:w-auto">
                        OK, I Understand
                    </button>
                </div>
            </div>
        </div>
    )
}
