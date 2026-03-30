import React from 'react'
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react'

export default function ErrorOverlay({ error, onRetry, onExit }) {
    if (!error) return null

    return (
        <div className="bg-bg-page/95 animate-in fade-in absolute inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center backdrop-blur-md">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-500">
                <AlertTriangle size={36} />
            </div>
            <h2 className="text-text-primary mb-2 text-2xl font-bold">Something went wrong</h2>
            <p className="text-text-secondary mb-8 max-w-sm text-sm leading-relaxed">
                {error.message || 'An unexpected error occurred during your interview session.'}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
                <button
                    onClick={onRetry}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95"
                >
                    <RefreshCw size={16} />
                    Retry Operation
                </button>
                <button
                    onClick={onExit}
                    className="border-border text-text-primary flex items-center justify-center gap-2 rounded-xl border px-6 py-2.5 text-sm font-bold transition-transform hover:scale-105 hover:bg-white/5 active:scale-95"
                >
                    <LogOut size={16} />
                    Exit Session
                </button>
            </div>

            {error.type && (
                <span className="text-text-muted mt-12 font-mono text-[10px] uppercase opacity-50">
                    Error Code: {error.type}
                </span>
            )}
        </div>
    )
}
