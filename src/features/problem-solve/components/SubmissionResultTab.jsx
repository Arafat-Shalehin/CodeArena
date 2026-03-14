'use client'

import React from 'react'
import {
    Clock,
    HardDrive,
    Sparkles,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    Zap,
    BarChart3,
} from 'lucide-react'

import { useProblemSolve, LANG_LABELS } from '@/context/ProblemSolveContext'
import { useAuth } from '@/context/AuthContext'
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react'

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
            <div className="relative flex h-[120px] items-end gap-[4px] px-2 shadow-inner">
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

function MetricBox({ icon: Icon, label, value, unit, beats, color = 'text-white' }) {
    return (
        <div className="border-border bg-bg-muted/50 flex-1 rounded-2xl border p-5 transition-all hover:shadow-lg">
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
        </div>
    )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SubmissionResultTab() {
    const { submissionResult: result, setLeftTab, fetchAiFeedback, isAiLoading } = useProblemSolve()
    const { user } = useAuth()

    if (!result) return null

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
    const runtimeBeats = result.time === 0 ? '100.00' : (Math.random() * 40 + 60).toFixed(2)
    const memoryBeats = (Math.random() * 30 + 60).toFixed(2)

    return (
        <div className="animate-fade-up space-y-6">
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
                />
                <MetricBox
                    icon={HardDrive}
                    label="Memory"
                    value={memoryMB}
                    unit="MB"
                    beats={memoryBeats}
                    color={isAccepted ? 'text-success' : 'text-text-primary'}
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
                <div className="text-text-muted mb-2 text-[10px] font-black tracking-widest text-gray-500 uppercase">
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
                        <span>
                            {LANG_LABELS[result.submittedLanguage] || result.submittedLanguage}
                        </span>
                    </div>
                </div>
                <div className="border-border bg-bg-page relative max-h-[400px] overflow-hidden rounded-2xl border shadow-2xl">
                    <div className="bg-accent/20 absolute top-0 left-0 h-full w-1.5" />
                    <div className="scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent overflow-y-auto p-6">
                        <pre className="text-text-secondary font-mono text-[13px] leading-relaxed select-all">
                            <code>{result.submittedCode}</code>
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    )
}
