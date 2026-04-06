'use client'

import React, { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import {
    Award,
    Download,
    FileText,
    ChevronLeft,
    AlertCircle,
    TrendingUp,
    MessageSquare,
    Trophy,
    Lightbulb,
    Code2,
    Sparkles,
    Target,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function ScorecardView({ sessionId }) {
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isSocketConnected, setIsSocketConnected] = useState(false)
    const socketRef = useRef(null)

    useEffect(() => {
        // Use a ref to track result so fallbackPoll doesn't use a stale closure
        const resultFoundRef = { current: false }
        let pollTimer
        let isUnmounted = false

        const fetchResult = async () => {
            try {
                const res = await fetch(`/api/interview/sessions/${sessionId}/result`)
                const json = await res.json()

                if (isUnmounted) return false

                if (json.success) {
                    if (json.status === 'pending') {
                        // Still calculating — stay in loading state
                        return false
                    }
                    resultFoundRef.current = true
                    setResult(json.data)
                    setLoading(false)
                    setError(null)
                    return true
                } else {
                    // API returned an explicit error — show it, stop loading
                    setError(json.message || 'Failed to load result')
                    setLoading(false)
                    return false
                }
            } catch (err) {
                if (!isUnmounted) {
                    // ✅ Bug 1 Fix: clear loading so the error UI renders
                    setError('Connection error. Retrying...')
                    // Do NOT call setLoading(false) here — we keep retrying via poll
                    // Only stop loading after max retries (handled in loadingTimeout below)
                }
                return false
            }
        }

        const setupSocket = async () => {
            try {
                const res = await fetch(`/api/interview/sessions/${sessionId}/rehydrate`)
                const json = await res.json()
                if (!json.success || isUnmounted) return

                const socket = io(
                    `${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002'}/interview`,
                    {
                        auth: { token: json.data.wsToken },
                        reconnectionAttempts: 5,
                    }
                )
                socketRef.current = socket

                socket.on('connect', async () => {
                    setIsSocketConnected(true)
                    socket.emit('interview:join')
                    // ✅ Bug 4 Fix: immediately fetch on connect.
                    // For already-completed sessions the scorecard socket event
                    // will never replay — so we fetch right away on connection.
                    if (!resultFoundRef.current) {
                        await fetchResult()
                    }
                })

                socket.on('disconnect', () => setIsSocketConnected(false))

                socket.on('interview:scorecard', async () => {
                    if (isUnmounted) return
                    console.log('[ScorecardView] Received push update via socket')
                    await fetchResult()
                })
            } catch (err) {
                console.error('[ScorecardView] Socket setup failed:', err)
            }
        }

        const runLogic = async () => {
            const found = await fetchResult()
            if (found || isUnmounted) return

            // Result not ready yet — set a 60s hard timeout before showing error
            const loadingTimeout = setTimeout(() => {
                if (!resultFoundRef.current && !isUnmounted) {
                    setError(
                        'Scorecard generation is taking longer than expected. Please wait or refresh.'
                    )
                    setLoading(false)
                }
            }, 60_000)

            // Set up socket for live push
            await setupSocket()

            // ✅ Bug 3 Fix: poll every 3s instead of 15s
            // ✅ Bug 2 Fix: use resultFoundRef instead of stale `result` closure
            const fallbackPoll = async () => {
                if (isUnmounted || resultFoundRef.current) {
                    clearTimeout(loadingTimeout)
                    return
                }
                const success = await fetchResult()
                if (!success) {
                    pollTimer = setTimeout(fallbackPoll, 3_000)
                } else {
                    clearTimeout(loadingTimeout)
                }
            }
            pollTimer = setTimeout(fallbackPoll, 3_000)
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

    const getScoreTheme = (score) => {
        if (score === 0) {
            return {
                colorClass: 'text-error',
                strokeClass: 'stroke-error',
                bgClass: 'bg-error/10',
                borderClass: 'border-error/20',
                heading: 'Incomplete \n Session.',
                subheading:
                    'Participation was insufficient to provide a technical evaluation of your skills.',
            }
        }
        if (score <= 40) {
            return {
                colorClass: 'text-error',
                strokeClass: 'stroke-error',
                bgClass: 'bg-error/10',
                borderClass: 'border-error/20',
                heading: 'Needs \n Focus.',
                subheading:
                    'There are significant gaps in your implementation that need attention.',
            }
        }
        if (score <= 70) {
            return {
                colorClass: 'text-warning',
                strokeClass: 'stroke-yellow-500',
                bgClass: 'bg-warning/10',
                borderClass: 'border-warning/20',
                heading: 'Solid \n Attempt.',
                subheading:
                    'You have a good foundation but missed some key optimization or edge cases.',
            }
        }
        return {
            colorClass: 'text-accent',
            strokeClass: 'stroke-accent',
            bgClass: 'bg-accent/10',
            borderClass: 'border-accent/20',
            heading: 'Exceptional \n Results.',
            subheading:
                'You demonstrated strong technical proficiency and clear communication throughout.',
        }
    }

    const theme = result ? getScoreTheme(result.overallScore || 0) : null

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
        <div className="bg-bg-page text-text-primary selection:bg-accent/30 min-h-screen overflow-x-hidden pb-10">
            {/* Header - Hidden on Print */}
            <header className="border-border bg-bg-page/80 sticky top-0 z-40 border-b px-6 py-4 backdrop-blur-xl print:hidden">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/interview/history"
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

            {/* Main Scorecard Content - 12 Column Grid */}
            <main className="mx-auto max-w-[1500px] px-8 pt-15 print:pt-0">
                <div className="grid grid-cols-12 gap-8 lg:gap-12">
                    {/* Overall Score Hero Card - 7 Columns */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="matte-surface relative col-span-12 flex flex-col justify-center overflow-hidden rounded-[3rem] p-10 shadow-2xl md:p-14 lg:col-span-7 lg:h-[450px]"
                    >
                        <div className="bg-accent/10 absolute -top-24 -right-24 h-64 w-64 blur-[100px]" />
                        <div className="relative z-10 flex flex-col items-center justify-between gap-10 md:flex-row">
                            <div className="space-y-6 text-center md:text-left">
                                <div
                                    className={`${theme.bgClass} ${theme.borderClass} ${theme.colorClass} inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase`}
                                >
                                    <TrendingUp size={12} />
                                    Performance Insight
                                </div>
                                <h2 className="text-text-primary text-5xl leading-[0.9] font-[1000] tracking-tighter md:text-7xl">
                                    {theme.heading.split('\n').map((line, idx) => (
                                        <React.Fragment key={idx}>
                                            {line}
                                            <br />
                                        </React.Fragment>
                                    ))}
                                </h2>
                                <p className="text-text-secondary max-w-sm text-base leading-relaxed font-medium opacity-80 md:text-lg">
                                    {theme.subheading}
                                </p>
                            </div>

                            <div className="relative flex h-48 w-48 shrink-0 items-center justify-center">
                                <svg className="absolute inset-0 h-full w-full -rotate-90 transform">
                                    <circle
                                        cx="50%"
                                        cy="50%"
                                        r="42%"
                                        className="stroke-border/20 fill-none"
                                        strokeWidth="12"
                                    />
                                    <motion.circle
                                        cx="50%"
                                        cy="50%"
                                        r="42%"
                                        className={`${theme.strokeClass} fill-none`}
                                        strokeWidth="12"
                                        strokeDasharray="264"
                                        initial={{ strokeDashoffset: 264 }}
                                        animate={{
                                            strokeDashoffset:
                                                264 - (264 * (result.overallScore || 0)) / 100,
                                        }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="text-center">
                                    <span
                                        className={`${theme.colorClass} block text-6xl font-[1000]`}
                                    >
                                        {result.overallScore}
                                    </span>
                                    <span className="text-text-muted text-[10px] font-bold tracking-widest uppercase">
                                        Final Score
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* AI Review Summary Card - 5 Columns */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="matte-surface col-span-12 flex flex-col rounded-[3rem] p-10 shadow-2xl md:p-14 lg:col-span-5 lg:h-[450px]"
                    >
                        <div className="mb-8 flex shrink-0 items-center gap-4">
                            <div className="bg-accent/10 rounded-2xl p-3 shadow-inner">
                                <Sparkles className="text-accent h-7 w-7" />
                            </div>
                            <h3 className="text-text-primary text-2xl font-black tracking-tight">
                                AI Review Summary
                            </h3>
                        </div>
                        <div className="custom-scrollbar grow overflow-y-auto pr-4">
                            <div className="text-text-secondary prose prose-invert max-w-none text-base leading-[1.7] font-medium opacity-90 md:text-lg">
                                <ReactMarkdown>{result.aiSummary}</ReactMarkdown>
                            </div>
                        </div>
                    </motion.section>

                    {/* Spacer row for visual separation */}
                    <div className="col-span-12 hidden h-4 lg:block" />

                    {/* Category Detail Scores - Row 2 (4 cards x 3 cols) */}
                    {[
                        {
                            label: 'Communication',
                            val: result.communicationScore,
                            color: 'text-blue-500',
                            bg: 'bg-blue-500',
                            icon: MessageSquare,
                        },
                        {
                            label: 'Coding Performance',
                            val: result.codeQualityScore,
                            color: 'text-emerald-500',
                            bg: 'bg-emerald-500',
                            icon: Code2,
                        },
                        {
                            label: 'Problem Solving',
                            val: result.problemSolvingScore,
                            color: 'text-accent',
                            bg: 'bg-accent',
                            icon: Target,
                        },
                        {
                            label: 'Technical Accuracy',
                            val: result.approachScore,
                            color: 'text-purple-500',
                            bg: 'bg-purple-500',
                            icon: Trophy,
                        },
                    ].map((item, i) => {
                        const getStatusDesc = (val) => {
                            if (val === 0) return 'No Participation'
                            if (val <= 40) return 'Critical Gap'
                            if (val <= 70) return 'Needs Focus'
                            return 'Strong Proficiency'
                        }
                        const statusDesc = getStatusDesc(item.val || 0)

                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className="matte-surface group relative col-span-6 overflow-hidden rounded-[2.5rem] border p-8 transition-all hover:-translate-y-1 md:col-span-3"
                            >
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <div
                                        className={`bg-opacity-10 mb-2 rounded-2xl bg-current p-3 transition-transform group-hover:scale-110 ${item.color}`}
                                    >
                                        <item.icon size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className={`text-3xl font-black ${item.color}`}>
                                                {item.val || 0}
                                            </span>
                                            <span className="text-text-muted text-[10px] font-bold">
                                                /100
                                            </span>
                                        </div>
                                        <p
                                            className={`text-[10px] font-black tracking-widest uppercase ${item.color}`}
                                        >
                                            {statusDesc}
                                        </p>
                                    </div>
                                    <div className="w-full space-y-2">
                                        <p className="text-text-primary text-[10px] font-black tracking-widest uppercase">
                                            {item.label}
                                        </p>
                                        <div className="bg-border/30 h-2 w-full overflow-hidden rounded-full">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.val || 0}%` }}
                                                transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
                                                className={`h-full ${item.bg}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}

                    {/* Spacer row for visual separation */}
                    <div className="col-span-12 hidden h-4 lg:block" />

                    {/* Insights: Left Col (Strengths & Weaknesses) - 6 Columns */}
                    <div className="col-span-12 space-y-6 lg:col-span-6">
                        {/* Strengths */}
                        <motion.section
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="matte-surface relative overflow-hidden rounded-[3rem] p-10 shadow-2xl md:p-12"
                        >
                            <div className="pointer-events-none absolute inset-0 bg-emerald-500/5" />
                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-3">
                                    <Trophy className="h-6 w-6 text-emerald-500" />
                                    <h3 className="text-text-primary text-xl font-black tracking-tight">
                                        Key Strengths
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    {result.strengths && result.strengths.length > 0 ? (
                                        result.strengths.map((s, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex items-start gap-4 rounded-3xl border border-emerald-500/10 bg-emerald-500/5 p-5 transition-all hover:bg-emerald-500/10"
                                            >
                                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-black text-emerald-500">
                                                    {i + 1}
                                                </span>
                                                <p className="text-text-primary text-base leading-snug font-bold">
                                                    {s}
                                                </p>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="bg-bg-subtle/50 border-border flex flex-col items-center justify-center rounded-4xl border border-dashed py-10 text-center">
                                            <p className="text-text-muted text-sm font-medium">
                                                No specific strengths identified.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.section>

                        {/* Weaknesses */}
                        <motion.section
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="matte-surface relative overflow-hidden rounded-[3rem] p-10 shadow-2xl md:p-12"
                        >
                            <div className="bg-error/5 pointer-events-none absolute inset-0" />
                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="text-error h-6 w-6" />
                                    <h3 className="text-text-primary text-xl font-black tracking-tight">
                                        Critical Weaknesses
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    {(result.weaknesses || result.areasToImprove) &&
                                    (result.weaknesses || result.areasToImprove).length > 0 ? (
                                        (result.weaknesses || result.areasToImprove).map((a, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="bg-error/5 border-error/10 hover:bg-error/10 flex items-start gap-4 rounded-3xl border p-5 transition-all"
                                            >
                                                <span className="bg-error/20 text-error flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black">
                                                    {i + 1}
                                                </span>
                                                <p className="text-text-primary text-base leading-snug font-bold">
                                                    {a}
                                                </p>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="bg-bg-subtle/50 border-border flex flex-col items-center justify-center rounded-4xl border border-dashed py-10 text-center">
                                            <p className="text-text-muted text-sm font-medium">
                                                No specific weaknesses identified.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.section>
                    </div>

                    {/* Recommendations: Right Col - 6 Columns */}
                    <motion.section
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="matte-surface relative col-span-12 overflow-hidden rounded-[3rem] p-10 shadow-2xl md:p-12 lg:col-span-6"
                    >
                        <div className="pointer-events-none absolute inset-0 bg-yellow-500/5" />
                        <div className="relative z-10 flex h-full flex-col space-y-8">
                            <div className="flex items-center gap-3">
                                <Lightbulb className="h-6 w-6 text-yellow-500" />
                                <h3 className="text-text-primary text-xl font-black tracking-tight">
                                    Expert Recommendations
                                </h3>
                            </div>

                            <div className="custom-scrollbar grid grid-cols-1 gap-4 overflow-y-auto pr-2">
                                {result.recommendations?.map((r, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="matte-surface group flex flex-col gap-4 rounded-4xl border-yellow-500/10 p-8 shadow-inner transition-all hover:border-yellow-500/30"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-yellow-500/20 text-xs font-black text-yellow-500">
                                                {i + 1}
                                            </div>
                                            <h4 className="text-sm font-black tracking-widest text-yellow-500 uppercase">
                                                {r.split(':')[0] || 'Recommendation'}
                                            </h4>
                                        </div>
                                        <p className="text-text-secondary text-base leading-relaxed font-bold opacity-90">
                                            {r.includes(':')
                                                ? r.split(':').slice(1).join(':').trim()
                                                : r}
                                        </p>
                                    </motion.div>
                                ))}
                                {(!result.recommendations ||
                                    result.recommendations.length === 0) && (
                                    <div className="bg-bg-subtle/50 border-border flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed p-12 text-center">
                                        <Target className="text-text-muted mb-4 h-12 w-12 opacity-20" />
                                        <p className="text-text-muted text-sm font-medium">
                                            No specific recommendations provided for this session.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.section>
                </div>

                {/* Footer Credits */}
                <footer className="border-border text-text-muted mt-20 mb-12 border-t pt-8 text-center text-[10px] font-bold tracking-widest uppercase">
                    CodeArena Artificial Intelligence • Session Protocol 8.4 •{' '}
                    {sessionId.toUpperCase()}
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
                    .matte-surface {
                        background: white !important;
                        border: 1px solid #e2e8f0 !important;
                        box-shadow: none !important;
                        backdrop-filter: none !important;
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
                    .print\\:hidden {
                        display: none !important;
                    }
                    button {
                        display: none !important;
                    }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--ca-border);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--ca-accent);
                }
            `}</style>
        </div>
    )
}
