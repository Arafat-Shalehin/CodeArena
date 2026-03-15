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
    Trophy,
    Lightbulb,
    Target,
    Code2,
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

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
                <section className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            label: 'Communication',
                            val: result.communicationScore,
                            color: 'text-blue-500',
                            icon: MessageSquare,
                        },
                        {
                            label: 'Coding Performance',
                            val: result.codeQualityScore,
                            color: 'text-emerald-500',
                            icon: Code2,
                        },
                        {
                            label: 'Problem Solving',
                            val: result.problemSolvingScore,
                            color: 'text-accent',
                            icon: Target,
                        },
                        {
                            label: 'Technical Accuracy',
                            val: result.approachScore,
                            color: 'text-purple-500',
                            icon: TrendingUp,
                        },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="border-border bg-bg-subtle/50 group hover:bg-bg-muted relative overflow-hidden rounded-[2rem] border p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div
                                    className={`bg-opacity-10 rounded-xl bg-current p-2 ${item.color}`}
                                >
                                    <item.icon size={18} />
                                </div>
                                <div className="text-right">
                                    <span className={`text-2xl font-black ${item.color}`}>
                                        {item.val}
                                    </span>
                                    <span className="text-text-muted ml-1 text-[10px] font-bold">
                                        /100
                                    </span>
                                </div>
                            </div>

                            <span className="text-text-primary text-xs font-black tracking-tight uppercase">
                                {item.label}
                            </span>

                            <div className="bg-border mt-4 h-1.5 w-full overflow-hidden rounded-full">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.val}%` }}
                                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                    className={`h-full ${item.color.replace('text-', 'bg-')}`}
                                />
                            </div>
                        </motion.div>
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

                {/* Strengths & Weaknesses */}
                <section className="mt-12 grid gap-8 md:grid-cols-2">
                    {/* Strengths */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <Trophy className="text-accent h-5 w-5" />
                            <h3 className="text-text-primary text-sm font-black tracking-widest uppercase">
                                Key Strengths
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {result.strengths?.map((s, i) => (
                                <div
                                    key={i}
                                    className="bg-accent/5 border-accent/10 text-text-primary group hover:bg-accent/10 flex gap-4 rounded-2xl border p-5 text-sm font-medium transition-all"
                                >
                                    <span className="text-accent font-black">{i + 1}.</span>
                                    {s}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Weaknesses */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <AlertCircle className="text-error h-5 w-5" />
                            <h3 className="text-text-primary text-sm font-black tracking-widest uppercase">
                                Critical Weaknesses
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {(result.weaknesses || result.areasToImprove)?.map((a, i) => (
                                <div
                                    key={i}
                                    className="bg-error/5 border-error/10 text-text-primary group hover:bg-error/10 flex gap-4 rounded-2xl border p-5 text-sm font-medium transition-all"
                                >
                                    <span className="text-error font-black">{i + 1}.</span>
                                    {a}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* Recommendations */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 space-y-4"
                >
                    <div className="flex items-center gap-3">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        <h3 className="text-text-primary text-sm font-black tracking-widest uppercase">
                            Expert Recommendations
                        </h3>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {result.recommendations?.map((r, i) => (
                            <div
                                key={i}
                                className="border-border bg-bg-subtle/50 hover:bg-bg-muted flex gap-4 rounded-2xl border p-6 text-sm font-medium backdrop-blur-xl transition-all"
                            >
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-500/10 text-[10px] font-black text-yellow-500">
                                    {i + 1}
                                </div>
                                {r}
                            </div>
                        ))}
                        {(!result.recommendations || result.recommendations.length === 0) && (
                            <div className="bg-bg-subtle border-border text-text-muted col-span-2 rounded-2xl border border-dashed p-8 text-center text-sm font-medium">
                                No specific recommendations provided for this session.
                            </div>
                        )}
                    </div>
                </motion.section>

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
