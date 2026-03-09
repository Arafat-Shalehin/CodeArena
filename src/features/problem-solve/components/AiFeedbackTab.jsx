'use client'

import React from 'react'
import {
    Activity,
    AlertTriangle,
    Bug,
    Check,
    CheckCircle2,
    Code2,
    Cpu,
    Gauge,
    Lightbulb,
    RotateCcw,
    Terminal,
    TrendingDown,
    Zap,
} from 'lucide-react'
import { useProblemSolve } from '@/context/ProblemSolveContext'

// Highlight code snippets in strings (like `m` or `HashMap`)
const formatText = (text) => {
    if (!text) return null
    const parts = text.split(/`([^`]+)`/g)
    return parts.map((part, index) => {
        if (index % 2 === 1) {
            return (
                <code
                    key={index}
                    className="bg-bg-muted/50 text-text-primary border-border/50 mx-0.5 rounded border px-1.5 py-0.5 font-mono text-[12px] font-medium tracking-tight"
                >
                    {part}
                </code>
            )
        }
        return part
    })
}

function Meter({ label, score }) {
    const percentage = (score / 5) * 100
    const colorClass = score >= 4.5 ? 'bg-success' : score >= 3 ? 'bg-accent' : 'bg-error'

    return (
        <div className="space-y-1.5">
            <div className="flex items-end justify-between text-[11px]">
                <span className="text-text-secondary font-medium">{label}</span>
                <span className="text-text-primary font-mono">
                    {score.toFixed(1)} <span className="text-text-muted">/ 5</span>
                </span>
            </div>
            <div className="bg-border/50 flex h-1.5 w-full overflow-hidden rounded-full">
                <div className={`h-full ${colorClass}`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}

export default function AiFeedbackTab() {
    const { aiFeedback: feedback, isAiLoading, fetchAiFeedback } = useProblemSolve()

    if (isAiLoading) {
        return (
            <div className="bg-bg-page border-border/50 flex h-full flex-col items-center justify-center gap-4 border-l">
                <div className="flex items-center gap-3">
                    <Activity size={16} className="text-text-muted animate-spin" />
                    <span className="text-text-muted cursor-default text-[12px] font-medium tracking-wide uppercase">
                        Running Static Analyzer...
                    </span>
                </div>
            </div>
        )
    }

    if (!feedback) {
        return (
            <div className="bg-bg-page border-border/50 flex h-full flex-col items-center justify-center gap-4 border-l p-6 text-center">
                <div className="bg-bg-muted/30 border-border/50 flex rounded-full border p-4">
                    <Terminal size={24} className="text-text-muted" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-text-primary text-[13px] font-semibold">
                        Ready for Analysis
                    </h3>
                    <p className="text-text-muted mx-auto max-w-[240px] text-[12px] leading-relaxed">
                        Execute our static analyzer to surface critical complexity insights and
                        refactoring advice.
                    </p>
                </div>
                <button
                    onClick={fetchAiFeedback}
                    className="bg-bg-subtle hover:bg-bg-muted border-border text-text-primary mt-2 flex items-center gap-2 rounded border px-4 py-2 text-[12px] font-medium transition-colors"
                >
                    <Zap size={14} /> Run Analyzer
                </button>
            </div>
        )
    }

    const { code_quality: cq = {} } = feedback
    const readScore =
        typeof cq.readability === 'number' ? cq.readability : parseFloat(cq.readability) || 4.2
    const effScore =
        typeof cq.efficiency === 'number' ? cq.efficiency : parseFloat(cq.efficiency) || 4.8
    const logicScore =
        typeof cq.correctness === 'number' ? cq.correctness : parseFloat(cq.correctness) || 5.0

    const scoreColor =
        feedback.rating >= 8 ? 'text-success' : feedback.rating >= 5 ? 'text-accent' : 'text-error'

    return (
        <div className="bg-bg-page text-text-primary border-border/50 flex h-full flex-col border-l font-sans">
            {/* Header Toolbar */}
            <div className="border-border/40 bg-bg-muted/10 flex shrink-0 items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-text-muted" />
                        <span className="text-text-secondary text-[12px] font-semibold tracking-wide">
                            Analysis Report
                        </span>
                    </div>
                </div>
                <button
                    onClick={fetchAiFeedback}
                    className="text-text-muted hover:text-text-primary flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase transition-colors"
                    title="Re-run Analysis"
                >
                    <RotateCcw size={12} /> Sync
                </button>
            </div>

            <div className="custom-scrollbar space-y-8 overflow-x-hidden overflow-y-auto p-5">
                {/* 1. Primary Metrics Dashboard */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="border-border/50 bg-bg-muted/10 group hover:border-text-primary/20 relative flex flex-col items-center justify-center overflow-hidden rounded-xl border p-4 shadow-sm transition-colors">
                        <div className="text-text-muted mb-1.5 flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
                            <Activity size={12} className="opacity-70" /> Score
                        </div>
                        <div className={`text-3xl font-black tracking-tighter ${scoreColor}`}>
                            {feedback.rating ? feedback.rating : '—'}
                            {feedback.rating && (
                                <span className="text-[14px] font-bold tracking-normal opacity-40">
                                    /10
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="border-border/50 bg-bg-muted/10 hover:border-text-primary/20 flex flex-col items-center justify-center rounded-xl border p-4 shadow-sm transition-colors">
                        <div className="text-text-muted mb-1.5 flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
                            <Gauge size={12} className="opacity-70" /> Time
                        </div>
                        <div className="text-accent font-mono text-xl font-bold tracking-tight">
                            {feedback.timeComplexity || 'O(N)'}
                        </div>
                    </div>

                    <div className="border-border/50 bg-bg-muted/10 hover:border-text-primary/20 flex flex-col items-center justify-center rounded-xl border p-4 shadow-sm transition-colors">
                        <div className="text-text-muted mb-1.5 flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
                            <Cpu size={12} className="opacity-70" /> Space
                        </div>
                        <div className="text-success font-mono text-xl font-bold tracking-tight">
                            {feedback.spaceComplexity || 'O(1)'}
                        </div>
                    </div>
                </div>

                {/* 2. Optimal Approach (if provided) - Expert Level Insight */}
                {feedback.optimal_approach && (
                    <div className="border-accent/20 bg-accent/5 overflow-hidden rounded-xl border">
                        <div className="border-accent/10 bg-accent/10 flex items-center gap-2 border-b px-4 py-3">
                            <Lightbulb size={14} className="text-accent" />
                            <h3 className="text-accent text-[12px] font-bold tracking-wider uppercase">
                                Optimal Strategy
                            </h3>
                        </div>
                        <div className="text-text-primary p-4 text-[13px] leading-relaxed">
                            {formatText(feedback.optimal_approach)}
                        </div>
                    </div>
                )}

                {/* 3. Actionable Improvements (Warnings/Refactoring) */}
                {feedback.improvements && feedback.improvements.length > 0 && (
                    <div className="space-y-3">
                        <div className="border-border/40 flex items-center gap-2 border-b pb-2">
                            <AlertTriangle size={14} className="text-orange-400" />
                            <h3 className="text-text-primary text-[12px] font-bold tracking-wider uppercase">
                                Actionable Feedback
                            </h3>
                        </div>
                        <ul className="space-y-3 pt-1">
                            {feedback.improvements.map((s, i) => (
                                <li
                                    key={i}
                                    className="text-text-secondary bg-bg-muted/10 hover:bg-bg-muted/20 flex gap-3.5 rounded-r-lg border-l-2 border-orange-400/80 p-4 text-[13px] leading-relaxed shadow-sm transition-colors"
                                >
                                    <div className="mt-0.5 shrink-0 text-orange-400/80">
                                        <Bug size={14} />
                                    </div>
                                    <div className="flex-1">{formatText(s)}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* 4. Code Strengths (Successes) */}
                {feedback.strengths && feedback.strengths.length > 0 && (
                    <div className="space-y-3">
                        <div className="border-border/40 flex items-center gap-2 border-b pb-2">
                            <CheckCircle2 size={14} className="text-success" />
                            <h3 className="text-text-primary text-[12px] font-bold tracking-wider uppercase">
                                Code Strengths
                            </h3>
                        </div>
                        <ul className="grid grid-cols-1 gap-2 pt-1">
                            {feedback.strengths.map((s, i) => (
                                <li
                                    key={i}
                                    className="bg-success/5 border-success/10 text-text-muted hover:bg-success/10 hover:text-text-primary flex cursor-default items-start gap-3 rounded-lg border px-3 py-2.5 text-[13px] leading-relaxed transition-colors"
                                >
                                    <div className="text-success/70 mt-[3px] shrink-0">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                    <div className="flex-1">{formatText(s)}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* 5. Code Quality Profile */}
                <div className="space-y-4 pb-4">
                    <div className="border-border/40 flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                            <Code2 size={14} className="text-text-muted" />
                            <h3 className="text-text-primary text-[12px] font-bold tracking-wider uppercase">
                                Quality Profile
                            </h3>
                        </div>
                    </div>
                    <div className="bg-bg-muted/5 border-border/50 text-text-muted grid grid-cols-1 gap-5 rounded-xl border p-5">
                        <Meter label="Readability & Style" score={readScore} />
                        <Meter label="Execution Efficiency" score={effScore} />
                        <Meter label="Logic & Correctness" score={logicScore} />
                    </div>
                </div>
            </div>
        </div>
    )
}
