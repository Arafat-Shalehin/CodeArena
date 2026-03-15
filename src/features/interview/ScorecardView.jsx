'use client'

import React, { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import {
    Award,
    Download,
    FileText,
    ChevronLeft,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    MessageSquare,
    ClipboardList,
} from 'lucide-react'
import Link from 'next/link'

export default function ScorecardView({ sessionId }) {
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isSocketConnected, setIsSocketConnected] = useState(false)
    const socketRef = useRef(null)

    useEffect(() => {
        let pollTimer
        let isUnmounted = false

        const fetchResult = async () => {
            try {
                const res = await fetch(`/api/interview/sessions/${sessionId}/result`)
                const json = await res.json()

                if (isUnmounted) return

                if (json.success) {
                    if (json.status === 'pending') {
                        // Still calculating, remain in loading state
                        return false
                    }
                    setResult(json.data)
                    setLoading(false)
                    setError(null)
                    return true // Success
                } else {
                    setError(json.message || 'Failed to load result')
                    setLoading(false)
                    return false
                }
            } catch (err) {
                if (!isUnmounted) {
                    setError('Communication error. Retrying...')
                }
                return false
            }
        }

        const setupSocket = async () => {
            try {
                // 1. Get wsToken via rehydrate
                const res = await fetch(`/api/interview/sessions/${sessionId}/rehydrate`)
                const json = await res.json()
                if (!json.success || isUnmounted) return

                // 2. Connect to socket
                const socket = io(
                    `${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002'}/interview`,
                    {
                        auth: { token: json.data.wsToken },
                        reconnectionAttempts: 5,
                    }
                )
                socketRef.current = socket

                socket.on('connect', () => {
                    setIsSocketConnected(true)
                    socket.emit('interview:join')
                })

                socket.on('disconnect', () => setIsSocketConnected(false))

                socket.on('interview:scorecard', async () => {
                    if (isUnmounted) return
                    console.log('[ScorecardView] Received Push update via socket')
                    await fetchResult()
                })
            } catch (err) {
                console.error('[ScorecardView] Socket setup failed:', err)
            }
        }

        const runLogic = async () => {
            const found = await fetchResult()
            if (!found && !isUnmounted) {
                // If not found yet, setup socket-push
                await setupSocket()

                // Fallback: Slow polling (15s) in case socket fails or message is missed
                const fallbackPoll = async () => {
                    if (isUnmounted || result) return
                    const success = await fetchResult()
                    if (!success) {
                        pollTimer = setTimeout(fallbackPoll, 15000)
                    }
                }
                pollTimer = setTimeout(fallbackPoll, 15000)
            }
        }

        runLogic()

        return () => {
            isUnmounted = true
            clearTimeout(pollTimer)
            if (socketRef.current) {
                socketRef.current.disconnect()
            }
        }
    }, [sessionId])

    const exportMarkdown = () => {
        window.location.href = `/api/interview/sessions/${sessionId}/export`
    }

    const exportPDF = () => {
        window.print()
    }

    if (loading) {
        return (
            <div className="bg-bg-page flex min-h-screen flex-col items-center justify-center">
                <div className="relative flex h-20 w-20 items-center justify-center">
                    <div className="bg-accent/20 absolute inset-0 animate-ping rounded-full" />
                    <Award className="text-accent h-10 w-10 animate-bounce" />
                </div>
                <p className="text-text-secondary mt-4 font-bold tracking-tight">
                    Analysing your performance...
                </p>

                {/* Connection Status Indicator */}
                <div className="border-border bg-bg-muted text-text-muted mt-6 flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold transition-all">
                    <div
                        className={`h-1.5 w-1.5 rounded-full ${isSocketConnected ? 'bg-success animate-pulse' : 'bg-text-muted'}`}
                    />
                    {isSocketConnected
                        ? 'LIVE UPDATES ACTIVE'
                        : 'CONNECTING TO REAL-TIME SERVER...'}
                </div>
            </div>
        )
    }

    if (error || !result) {
        return (
            <div className="bg-bg-page flex min-h-screen flex-col items-center justify-center p-6 text-center">
                <div className="bg-error/10 text-error mb-4 rounded-full p-4">
                    <AlertCircle size={40} />
                </div>
                <h2 className="text-text-primary text-xl font-bold">Results Pending</h2>
                <p className="text-text-secondary mt-2 max-w-sm">
                    Your interview evaluation is still being processed. Please check back in a few
                    minutes.
                </p>
                <Link
                    href="/interview"
                    className="bg-bg-subtle border-border text-text-primary hover:bg-bg-muted mt-8 rounded-xl border px-6 py-2.5 text-sm font-bold transition-all"
                >
                    Back to History
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-bg-page text-text-primary selection:bg-accent/30 min-h-screen pb-20">
            {/* Header - Hidden on Print */}
            <header className="border-border bg-bg-page/80 sticky top-0 z-40 border-b px-6 py-4 backdrop-blur-xl print:hidden">
                <div className="mx-auto flex max-w-5xl items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/interview"
                            className="group border-border bg-bg-subtle hover:bg-bg-muted flex h-10 w-10 items-center justify-center rounded-xl border transition-all"
                        >
                            <ChevronLeft className="text-text-secondary h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
                        </Link>
                        <div>
                            <h1 className="text-text-primary text-sm font-black tracking-tight uppercase sm:text-base">
                                Scorecard
                            </h1>
                            <p className="text-text-muted text-[10px] font-bold tracking-widest uppercase">
                                {result.problemTitle || 'Session Result'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportMarkdown}
                            className="bg-bg-muted hover:bg-bg-elevated flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95"
                        >
                            <FileText size={14} className="text-accent" />
                            <span className="hidden sm:inline">Export MD</span>
                        </button>
                        <button
                            onClick={exportPDF}
                            className="bg-accent shadow-accent/20 hover:bg-accent-hover flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-black shadow-lg transition-all active:scale-95"
                        >
                            <Download size={14} />
                            <span className="hidden sm:inline">Download PDF</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Scorecard Content */}
            <main className="mx-auto max-w-4xl px-6 pt-12 print:pt-0">
                {/* Hero Section: Overall Score */}
                <section className="border-border bg-bg-subtle/50 relative overflow-hidden rounded-[2.5rem] border p-8 shadow-2xl backdrop-blur-3xl md:p-12">
                    <div className="bg-accent/5 absolute top-0 right-0 h-64 w-64 blur-[100px]" />
                    <div className="bg-grid-white/[0.02] pointer-events-none absolute inset-0" />

                    <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
                        <div className="space-y-4 text-center md:text-left">
                            <div className="border-accent/20 bg-accent/10 text-accent inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase">
                                <TrendingUp size={12} />
                                Performance Insight
                            </div>
                            <h2 className="text-text-primary text-4xl font-[1000] tracking-tight md:text-6xl">
                                Exceptional <br className="hidden md:block" /> Results.
                            </h2>
                            <p className="text-text-secondary max-w-md text-sm leading-relaxed font-medium md:text-base">
                                You demonstrated strong technical proficiency and clear
                                communication during this {result.problemTitle} interview.
                            </p>
                        </div>

                        <div className="border-border bg-bg-page relative flex h-48 w-48 items-center justify-center rounded-full border-[10px] shadow-inner md:h-56 md:w-56">
                            {/* Score Circle */}
                            <svg className="absolute inset-0 h-full w-full -rotate-90 transform">
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="44%"
                                    className="stroke-border/50 fill-none"
                                    strokeWidth="10"
                                />
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="44%"
                                    className="stroke-accent fill-none transition-all duration-1000 ease-out"
                                    strokeWidth="10"
                                    strokeDasharray="276"
                                    strokeDashoffset={
                                        276 - (276 * (result.overallScore || 0)) / 100
                                    }
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="text-center">
                                <span className="text-text-primary block text-5xl font-[1000] md:text-6xl">
                                    {result.overallScore}
                                </span>
                                <span className="text-text-muted text-[10px] font-bold tracking-widest uppercase">
                                    Final Score
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Grid: Detailed Ratings */}
                <section className="mt-8 grid gap-6 md:grid-cols-3">
                    {[
                        {
                            label: 'Communication',
                            val: result.communicationScore,
                            color: 'text-accent',
                        },
                        {
                            label: 'Technical Approach',
                            val: result.approachScore,
                            color: 'text-accent',
                        },
                        {
                            label: 'Code Quality',
                            val: result.codeQualityScore,
                            color: 'text-accent',
                        },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="border-border bg-bg-subtle/50 hover:bg-bg-muted rounded-3xl border p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <span className="text-text-muted text-[10px] font-black tracking-widest uppercase">
                                {item.label}
                            </span>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className={`text-3xl font-[1000] ${item.color}`}>
                                    {item.val}
                                </span>
                                <span className="text-text-muted text-sm font-bold">/ 100</span>
                            </div>
                            <div className="bg-border mt-4 h-1.5 w-full overflow-hidden rounded-full">
                                <div
                                    className={`h-full transition-all duration-700 ${item.color.replace('text-', 'bg-')}`}
                                    style={{ width: `${item.val}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </section>

                {/* AI Summary */}
                <section className="mt-12 space-y-4">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="text-accent h-5 w-5" />
                        <h3 className="text-text-primary text-sm font-black tracking-widest uppercase">
                            AI Review Summary
                        </h3>
                    </div>
                    <div className="border-border bg-bg-subtle/50 text-text-secondary rounded-3xl border p-8 text-sm leading-relaxed font-medium backdrop-blur-xl md:text-base">
                        {result.aiSummary}
                    </div>
                </section>

                {/* Strengths & Improvements */}
                <section className="mt-12 grid gap-8 md:grid-cols-2">
                    {/* Strengths */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-accent h-5 w-5" />
                            <h3 className="text-text-primary text-sm font-black tracking-widest uppercase">
                                Key Strengths
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {result.strengths?.map((s, i) => (
                                <div
                                    key={i}
                                    className="bg-accent/5 border-accent/10 text-accent hover:bg-accent/10 flex gap-3 rounded-2xl border p-4 text-sm font-medium transition-all"
                                >
                                    <span className="font-mono opacity-50">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Improvements */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <ClipboardList className="text-warning h-5 w-5" />
                            <h3 className="text-text-primary text-sm font-black tracking-widest uppercase">
                                Growth Areas
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {result.areasToImprove?.map((a, i) => (
                                <div
                                    key={i}
                                    className="bg-warning/5 border-warning/10 text-warning hover:bg-warning/10 flex gap-3 rounded-2xl border p-4 text-sm font-medium transition-all"
                                >
                                    <span className="font-mono opacity-50">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    {a}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer Credits */}
                <footer className="border-border text-text-muted mt-20 border-t pt-8 text-center text-[10px] font-bold tracking-widest uppercase">
                    CodeArena Artificial Intelligence • Session ID:{' '}
                    <span className="text-text-primary font-mono">{sessionId.toUpperCase()}</span>
                </footer>
            </main>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 1cm;
                        size: A4;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    .bg-bg-page {
                        background: white !important;
                    }
                    .bg-bg-subtle {
                        background: #f8fafc !important;
                        border: 1px solid #e2e8f0 !important;
                    }
                    .text-text-primary {
                        color: #0f172a !important;
                    }
                    .text-text-secondary,
                    .text-text-muted {
                        color: #475569 !important;
                    }
                    .border-border {
                        border-color: #e2e8f0 !important;
                    }
                    .shadow-2xl,
                    .shadow-lg {
                        box-shadow: none !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    button {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    )
}
