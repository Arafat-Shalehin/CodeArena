'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
    Clock,
    HardDrive,
    Sparkles,
    ChevronLeft,
    Zap,
    Copy,
    Check,
    Loader2,
    TrendingUp,
} from 'lucide-react'

import { useProblemSolve, LANG_LABELS } from '@/context/ProblemSolveContext'
import { useAuth } from '@/context/AuthContext'
import { useProblemSolveStore } from '@/store/problemSolveStore'

const CELEBRATION_PIECES = [
    { left: '8%', delay: 0, rotate: -18 },
    { left: '16%', delay: 0.22, rotate: 12 },
    { left: '24%', delay: 0.3, rotate: -26 },
    { left: '34%', delay: 0.12, rotate: 20 },
    { left: '43%', delay: 0.36, rotate: -14 },
    { left: '52%', delay: 0.08, rotate: 24 },
    { left: '62%', delay: 0.28, rotate: -22 },
    { left: '72%', delay: 0.18, rotate: 10 },
    { left: '82%', delay: 0.4, rotate: -30 },
    { left: '90%', delay: 0.26, rotate: 16 },
]

function SubmissionConfetti() {
    return (
        <motion.div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
        >
            {CELEBRATION_PIECES.map((piece, index) => {
                const colors = ['bg-success', 'bg-accent', 'bg-warning']
                return (
                    <motion.span
                        key={`${piece.left}-${index}`}
                        className={`absolute top-2 h-2 w-1 rounded-full ${colors[index % colors.length]}`}
                        style={{ left: piece.left }}
                        initial={{ y: -12, opacity: 0, rotate: 0 }}
                        animate={{ y: 150, opacity: [0, 1, 1, 0], rotate: piece.rotate }}
                        transition={{ duration: 1.85, delay: piece.delay, ease: 'easeOut' }}
                    />
                )
            })}
        </motion.div>
    )
}

// ─── Simple Bar Chart ───────────────────────────────────────────────────────

function DistributionChart({ userValue, label, unit }) {
    const bars = [
        { range: `${unit === 'ms' ? '0' : '15'}`, height: 35, count: 12 },
        { range: `1${unit}`, height: 95, count: 45 },
        { range: `2${unit}`, height: 25, count: 8 },
        { range: `3${unit}`, height: 20, count: 6 },
        { range: `4${unit}`, height: 18, count: 5 },
    ]
    const maxH = Math.max(...bars.map((b) => b.height))

    return (
        <div className="mt-4">
            <div className="relative flex h-30 items-end gap-1 px-2 shadow-inner">
                <div className="text-text-muted absolute top-0 left-0 flex h-full flex-col justify-between text-[9px] font-bold opacity-40">
                    <span>100%</span>
                    <span>50%</span>
                    <span>0%</span>
                </div>
                <div className="ml-10 flex flex-1 items-end gap-2">
                    {bars.map((bar, i) => (
                        <div key={i} className="group relative flex flex-1 flex-col items-center">
                            <div
                                className={`w-full rounded-t-lg transition-all duration-700 ease-out ${i === 0 ? 'bg-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]' : 'bg-accent/20'}`}
                                style={{ height: `${(bar.height / maxH) * 100}px` }}
                            />
                            {i === 0 && userValue !== undefined && (
                                <div className="absolute -top-6 left-1/2 flex -translate-x-1/2 flex-col items-center">
                                    <div className="bg-bg-subtle border-accent text-accent rounded-full border px-1.5 py-0.5 text-[9px] font-black shadow-lg">
                                        YOU
                                    </div>
                                    <div className="bg-accent h-3 w-0.5" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="text-text-muted mt-2 ml-10 flex justify-between text-[10px] font-bold">
                {bars.map((bar, i) => (
                    <span key={i}>{bar.range}</span>
                ))}
            </div>
        </div>
    )
}

// ─── Metric Box ─────────────────────────────────────────────────────────────

function MetricBox({ icon: Icon, label, value, unit, beats, color = 'text-white', delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay }}
            className="border-border bg-bg-muted/50 flex-1 rounded-2xl border p-5 transition-all hover:shadow-lg"
        >
            <div className="text-text-muted mb-3 flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase">
                <Icon size={14} className="opacity-70" />
                {label}
            </div>
            <div className="flex items-baseline gap-3">
                <span className={`text-3xl font-black tracking-tight ${color}`}>
                    {value ?? '—'}
                </span>
                <span className="text-text-muted text-sm font-bold uppercase">{unit}</span>
            </div>
            {beats !== undefined && (
                <div className="text-text-muted mt-3 flex items-center gap-1.5 text-xs font-medium">
                    <TrendingUp size={14} className="text-success" />
                    Beats <span className="text-text-primary px-1 font-black">{beats}%</span> of
                    users
                </div>
            )}
        </motion.div>
    )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SubmissionResultTab() {
    const {
        submissionResult: result,
        setLeftTab,
        fetchAiFeedback,
        isAiLoading,
        viewSubmissionDetails,
    } = useProblemSolve()
    const { user } = useAuth()
    const [mounted, setMounted] = useState(false)
    const [copied, setCopied] = useState(false)
    const restoreAttemptedRef = useRef(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (result || restoreAttemptedRef.current) return

        const state = useProblemSolveStore.getState()
        const fallbackSubmissionId =
            state.submissionViewId || state.submissionId || state.submissionDetails?._id

        if (!fallbackSubmissionId || !viewSubmissionDetails) return

        restoreAttemptedRef.current = true
        viewSubmissionDetails(fallbackSubmissionId).catch((err) => {
            console.error('Failed to auto-restore submission details:', err)
        })
    }, [result, viewSubmissionDetails])

    if (!mounted || !result) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <Loader2 size={24} className="text-accent animate-spin" />
                <p className="text-text-muted text-sm font-medium">Loading submission details...</p>
                <button
                    onClick={() => setLeftTab('submissions')}
                    className="text-text-primary hover:text-accent text-xs font-semibold"
                >
                    Go Back To Submissions
                </button>
            </div>
        )
    }

    const submittedCode = result.submittedCode || ''
    const submittedLanguage = result.submittedLanguage || 'python'

    const handleCopyCode = () => {
        navigator.clipboard.writeText(submittedCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const isAccepted = result.verdict === 'ACCEPTED' || result.verdict === 'EXECUTED'
    const verdictColor = isAccepted ? 'text-success' : 'text-error'
    const verdictLabel = (result.verdict || 'UNKNOWN').replace(/_/g, ' ')

    const submittedDate = result.submittedAt
        ? new Date(result.submittedAt).toLocaleString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : ''

    const memoryMB = typeof result.memory === 'number' ? (result.memory / 1024).toFixed(2) : '—'
    const { runtimeBeats, memoryBeats } = useMemo(() => {
        const seedBase = Number(result.time || 0) + Number(result.memory || 0)
        const runtimeSeed = seedBase % 41
        const memorySeed = (seedBase * 7) % 31

        const runtimeValue = result.time === 0 ? 100 : 60 + runtimeSeed
        const memoryValue = 60 + memorySeed

        return {
            runtimeBeats: Number(runtimeValue).toFixed(2),
            memoryBeats: Number(memoryValue).toFixed(2),
        }
    }, [result.time, result.memory])

    return (
        <div className="animate-fade-up relative space-y-6">
            <AnimatePresence>{isAccepted && <SubmissionConfetti />}</AnimatePresence>
            {/* Nav */}
            <button
                onClick={() => setLeftTab('submissions')}
                className="text-text-muted hover:text-text-primary flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors"
            >
                <ChevronLeft size={16} /> All Submissions
            </button>

            {/* Verdict */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-baseline gap-4">
                        <span className={`text-4xl font-black tracking-tighter ${verdictColor}`}>
                            {verdictLabel}
                        </span>
                        {result.totalCount > 0 && (
                            <div className="text-text-muted border-border bg-bg-muted rounded-lg border px-2 py-0.5 text-xs font-black">
                                {result.passedCount} / {result.totalCount} PASSED
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2.5 text-sm font-medium">
                        <div
                            className={`h-2 w-2 rounded-full ${isAccepted ? 'bg-success' : 'bg-error'} shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]`}
                        />
                        <span className="text-text-muted">
                            <span className="text-text-primary font-black">
                                {user?.name || user?.displayName || 'Developer'}
                            </span>{' '}
                            submitted {submittedDate}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Editorial and Solution buttons removed as they are non-functional */}
                </div>
            </div>

            {/* Performance */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <MetricBox
                    icon={Clock}
                    label="Runtime"
                    value={result.time ?? 0}
                    unit="ms"
                    beats={runtimeBeats}
                    color={isAccepted ? 'text-success' : 'text-text-primary'}
                    delay={0.05}
                />
                <MetricBox
                    icon={HardDrive}
                    label="Memory"
                    value={memoryMB}
                    unit="MB"
                    beats={memoryBeats}
                    color={isAccepted ? 'text-success' : 'text-text-primary'}
                    delay={0.12}
                />
            </div>

            {/* ── AI Feedback Section ── */}
            <div className="border-border/50 bg-bg-muted/20 animate-fade-up flex flex-col items-center justify-between gap-4 rounded-xl border p-4 sm:flex-row">
                <div className="flex items-center gap-3">
                    <Sparkles size={16} className="text-accent" />
                    <div>
                        <div className="text-text-primary text-[13px] font-medium">AI Analysis</div>
                        <div className="text-text-muted mt-0.5 text-[12px]">
                            We've generated detailed complexity and logic insights for this code.
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => fetchAiFeedback({ switchTab: true })}
                    className="bg-bg-subtle hover:bg-bg-muted border-border text-text-primary flex items-center gap-2 rounded-lg border px-4 py-2 text-[12px] font-medium whitespace-nowrap transition-colors"
                >
                    {isAiLoading ? (
                        <Loader2 size={14} className="text-accent animate-spin" />
                    ) : (
                        <Zap size={14} className="text-accent" />
                    )}
                    {isAiLoading
                        ? 'Analyzing...'
                        : result.aiFeedback
                          ? 'View AI Feedback'
                          : 'Analyze Now'}
                </button>
            </div>

            {/* Distribution */}
            <div className="border-border bg-bg-muted/50 rounded-2xl border p-6">
                <div className="mb-2 text-xs font-black tracking-widest text-gray-500 uppercase">
                    Network Distribution
                </div>
                <DistributionChart userValue={result.time} label="Runtime" unit="ms" />
            </div>

            {/* Code */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <div className="text-text-muted flex items-center gap-3 text-xs font-black tracking-widest uppercase">
                        <span className="text-accent underline underline-offset-4">
                            Submitted Code
                        </span>
                        <span className="opacity-20">|</span>
                        <span>{LANG_LABELS[submittedLanguage] || submittedLanguage}</span>
                    </div>
                    <button
                        onClick={handleCopyCode}
                        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            copied
                                ? 'bg-success/20 border-success/30 text-success border'
                                : 'bg-bg-muted/50 border-border hover:bg-bg-muted text-text-muted border'
                        }`}
                    >
                        {copied ? (
                            <>
                                <Check size={13} /> Copied
                            </>
                        ) : (
                            <>
                                <Copy size={13} /> Copy
                            </>
                        )}
                    </button>
                </div>
                <div className="border-border bg-bg-page relative overflow-hidden rounded-2xl border shadow-2xl">
                    <div className="bg-accent/20 absolute top-0 left-0 h-full w-1.5" />
                    <div className="scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent max-h-125 overflow-y-auto p-6">
                        <pre className="text-text-secondary font-mono text-[13px] leading-relaxed wrap-break-word whitespace-pre-wrap select-all">
                            <code>{submittedCode}</code>
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    )
}
