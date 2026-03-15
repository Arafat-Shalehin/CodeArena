'use client'

import React, { useState, useEffect } from 'react'
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
    ChevronDown,
    AlertCircle,
    Flame,
    Award,
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
                    className="bg-bg-muted/50 text-text-primary border-border/50 mx-0.5 rounded border px-1.5 py-0.5 font-mono text-[13px] font-medium tracking-tight"
                >
                    {part}
                </code>
            )
        }
        return part
    })
}

// Radial Progress Circle Component
function RadialProgress({ rating, size = 100, strokeWidth = 6 }) {
    const circumference = 2 * Math.PI * ((size - strokeWidth) / 2)
    const offset = circumference - (rating / 10) * circumference
    const radius = (size - strokeWidth) / 2

    let color = '#02ba4c' // HackerRank green
    if (rating < 5)
        color = '#dc2626' // error red
    else if (rating < 7)
        color = '#d97706' // warning orange
    else color = '#02ba4c' // accent green

    return (
        <div
            className="relative flex items-center justify-center"
            style={{ width: size, height: size }}
        >
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-bg-muted/20"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                />
            </svg>
            <div className="absolute text-center">
                <div style={{ color }} className="text-2xl font-black">
                    {rating.toFixed(1)}
                </div>
                <div className="text-text-muted text-[11px] font-semibold tracking-tight uppercase">
                    /10
                </div>
            </div>
        </div>
    )
}

// Accordion Component for Hints
function Accordion({ title, children, defaultOpen = false }) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="border-border/30 bg-bg-muted/5 hover:bg-bg-muted/10 rounded-lg border transition-colors">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-text-primary hover:text-accent flex w-full items-center justify-between p-2.5 font-medium transition-colors"
            >
                <span className="text-[13px] font-semibold">{title}</span>
                <ChevronDown
                    size={16}
                    className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            {isOpen && (
                <div className="text-text-secondary border-border/30 border-t px-2.5 py-2 text-[13px] leading-relaxed">
                    {children}
                </div>
            )}
        </div>
    )
}

// Enhanced Radar Chart Component (3-axis with dynamic colors)
function RadarChart({ correctness, efficiency, readability, size = 140, verdict = '' }) {
    const center = size / 2
    const radius = size / 2.8
    const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3]

    const points = [
        { value: correctness / 5, angle: angles[0], label: 'Correctness' },
        { value: efficiency / 5, angle: angles[1], label: 'Efficiency' },
        { value: readability / 5, angle: angles[2], label: 'Readability' },
    ]

    // Verdict-based colors
    let fillColor = '#02ba4c40' // green
    let strokeColor = '#02ba4c'
    if (verdict.includes('wrong') || verdict.includes('error') || verdict.includes('runtime')) {
        fillColor = '#dc262640' // red
        strokeColor = '#dc2626'
    } else if (verdict.includes('time') || verdict.includes('memory')) {
        fillColor = '#d9770640' // orange
        strokeColor = '#d97706'
    }

    const getCoord = (value, angle) => ({
        x: center + value * radius * Math.cos(angle - Math.PI / 2),
        y: center + value * radius * Math.sin(angle - Math.PI / 2),
    })

    const pathPoints = points
        .map((p) => {
            const coord = getCoord(p.value, p.angle)
            return `${coord.x},${coord.y}`
        })
        .join(' ')

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative">
                <svg
                    width={size + 30}
                    height={size + 30}
                    className="relative"
                    viewBox={`-15 -15 ${size + 30} ${size + 30}`}
                >
                    {/* Background gradient-like effect with defs */}
                    <defs>
                        <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style={{ stopColor: '#f8f9fa', stopOpacity: 0.8 }} />
                            <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
                        </radialGradient>
                    </defs>

                    {/* Background circle */}
                    <circle cx={center} cy={center} r={radius} fill="url(#radarGrad)" />

                    {/* Grid circles - lighter */}
                    {[1, 2, 3, 4, 5].map((i) => (
                        <circle
                            key={i}
                            cx={center}
                            cy={center}
                            r={(i / 5) * radius}
                            fill="none"
                            stroke="#d1d5db"
                            strokeWidth="0.8"
                            opacity="0.6"
                        />
                    ))}

                    {/* Axes with labels */}
                    {points.map((p, i) => {
                        const coord = getCoord(1.15, p.angle)
                        const axisCoord = getCoord(1, p.angle)
                        return (
                            <g key={`axis-${i}`}>
                                <line
                                    x1={center}
                                    y1={center}
                                    x2={axisCoord.x}
                                    y2={axisCoord.y}
                                    stroke="#e5e7eb"
                                    strokeWidth="1"
                                />
                                {/* Axis labels directly on chart */}
                                <text
                                    x={coord.x}
                                    y={coord.y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize="11"
                                    fontWeight="600"
                                    fill="#374151"
                                    style={{ pointerEvents: 'none' }}
                                >
                                    {p.label}
                                </text>
                            </g>
                        )
                    })}

                    {/* Data polygon */}
                    <polygon
                        points={pathPoints}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth="2.5"
                        opacity="0.85"
                        style={{ filter: `drop-shadow(0 0 8px ${strokeColor}40)` }}
                    />

                    {/* Data points with glow */}
                    {points.map((p, i) => {
                        const coord = getCoord(p.value, p.angle)
                        return (
                            <g key={`point-${i}`}>
                                <circle
                                    cx={coord.x}
                                    cy={coord.y}
                                    r="4"
                                    fill={strokeColor}
                                    opacity="0.9"
                                    style={{ filter: `drop-shadow(0 0 4px ${strokeColor}60)` }}
                                />
                                <circle
                                    cx={coord.x}
                                    cy={coord.y}
                                    r="6"
                                    fill="none"
                                    stroke={strokeColor}
                                    strokeWidth="1"
                                    opacity="0.4"
                                />
                            </g>
                        )
                    })}
                </svg>
            </div>

            {/* Inline Metrics */}
            <div className="grid w-full grid-cols-3 gap-2 text-center">
                {points.map((p, i) => (
                    <div key={i} className="space-y-0.5">
                        <div className="text-text-secondary text-[11px] font-semibold">
                            {p.label}
                        </div>
                        <div
                            className="font-mono text-[13px] font-bold"
                            style={{ color: strokeColor }}
                        >
                            {(p.value * 5).toFixed(1)}/5
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Typewriter Effect Hook
function useTypewriter(text, speed = 50, delay = 0) {
    const [displayText, setDisplayText] = useState('')
    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            let index = 0
            const interval = setInterval(() => {
                if (index < text.length) {
                    setDisplayText(text.slice(0, index + 1))
                    index++
                } else {
                    setIsComplete(true)
                    clearInterval(interval)
                }
            }, speed)

            return () => clearInterval(interval)
        }, delay)

        return () => clearTimeout(timer)
    }, [text, speed, delay])

    return { displayText, isComplete }
}

export default function AiFeedbackTab() {
    const { aiFeedback: feedback, isAiLoading, fetchAiFeedback, testResult } = useProblemSolve()

    // Determine verdict-based theming
    const getThemeColors = () => {
        const verdict = feedback?.verdict?.toLowerCase() || ''
        if (verdict.includes('accepted') || verdict.includes('passed')) {
            return {
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/30',
                text: 'text-emerald-600',
                icon: 'text-emerald-500',
            }
        } else if (verdict.includes('wrong') || verdict.includes('error')) {
            return {
                bg: 'bg-rose-500/10',
                border: 'border-rose-500/30',
                text: 'text-rose-600',
                icon: 'text-rose-500',
            }
        } else if (verdict.includes('time') || verdict.includes('memory')) {
            return {
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/30',
                text: 'text-amber-600',
                icon: 'text-amber-500',
            }
        }
        return {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30',
            text: 'text-blue-600',
            icon: 'text-blue-500',
        }
    }

    const getMentorVerdict = () => {
        const rating = feedback?.rating || 0
        if (rating >= 9) return 'Exceptional Work'
        if (rating >= 7) return 'Solid Logic'
        if (rating >= 5) return 'Fair Attempt'
        if (rating >= 3) return 'Needs Work'
        return 'Critical Issues'
    }

    if (isAiLoading) {
        return (
            <div className="bg-bg-page border-border/50 flex h-full flex-col items-center justify-center gap-4 border-l">
                <div className="flex items-center gap-3">
                    <Activity size={16} className="text-text-muted animate-spin" />
                    <span className="text-text-muted cursor-default text-[13px] font-medium tracking-wide uppercase">
                        Analyzing Your Code...
                    </span>
                </div>
            </div>
        )
    }

    if (!feedback) {
        return (
            <div className="bg-bg-page border-border/50 flex h-full flex-col items-center justify-center gap-3 border-l p-4 text-center">
                <div className="bg-bg-muted/30 border-border/50 flex rounded-full border p-3">
                    <Terminal size={20} className="text-text-muted" />
                </div>
                <div className="space-y-0.5">
                    <h3 className="text-text-primary text-[13px] font-semibold">
                        Ready for Analysis
                    </h3>
                    <p className="text-text-muted mx-auto max-w-56 text-[12px] leading-relaxed">
                        Get AI-powered code analysis &amp; optimization tips
                    </p>
                </div>
                <button
                    onClick={fetchAiFeedback}
                    className="bg-accent mt-2 flex items-center gap-1.5 rounded px-3 py-1.5 text-[12px] font-semibold text-white transition-all hover:bg-[#029e40]"
                >
                    <Zap size={12} /> Analyze
                </button>
            </div>
        )
    }

    const theme = getThemeColors()
    const qm = feedback.quality_metrics || {}
    const readScore =
        typeof qm.readability === 'number' ? qm.readability : parseFloat(qm.readability) || 0
    const effScore =
        typeof qm.efficiency === 'number' ? qm.efficiency : parseFloat(qm.efficiency) || 0
    const logicScore =
        typeof qm.correctness === 'number' ? qm.correctness : parseFloat(qm.correctness) || 0

    // Derive verdict from available data
    const getVerdictStatus = () => {
        // First, check if AI provided explicit verdict
        if (feedback.verdict) return feedback.verdict

        // Use actual test execution verdict as source of truth
        const executionVerdict = (testResult?.verdict || 'UNKNOWN').toUpperCase()
        if (executionVerdict === 'ACCEPTED') return 'ACCEPTED'
        if (executionVerdict.includes('TIME')) return 'TIME_LIMIT_EXCEEDED'
        if (executionVerdict.includes('MEMORY')) return 'MEMORY_LIMIT_EXCEEDED'
        if (executionVerdict.includes('WRONG')) return 'WRONG_ANSWER'
        if (executionVerdict.includes('RUNTIME')) return 'RUNTIME_ERROR'

        // Fallback: if we have quality metrics, derive from those
        if (logicScore >= 3 && !feedback.critical_flaws?.length) {
            return 'ACCEPTED'
        } else if (feedback.critical_flaws?.length > 0) {
            return 'WRONG_ANSWER'
        }

        return 'RUNTIME_ERROR'
    }

    const verdictStatus = getVerdictStatus()

    return (
        <div className="bg-bg-page text-text-primary border-border/50 flex h-full flex-col border-l font-sans transition-colors duration-500">
            {/* Header */}
            <div className="border-border/30 bg-bg-muted/5 flex shrink-0 items-center justify-between border-b px-3 py-2">
                <div className="flex items-center gap-2">
                    <Lightbulb size={13} className="text-accent" />
                    <span className="text-text-secondary text-[12px] font-bold tracking-wide uppercase">
                        AI Analysis
                    </span>
                </div>
                <button
                    onClick={fetchAiFeedback}
                    className="text-text-muted hover:text-accent flex items-center gap-1 text-[11px] font-medium uppercase transition-colors"
                    title="Re-run Analysis"
                >
                    <RotateCcw size={11} /> Refresh
                </button>
            </div>

            <div className="custom-scrollbar space-y-3 overflow-x-hidden overflow-y-auto p-3">
                {/* 1. Top Metrics Row */}
                <div className="grid grid-cols-3 gap-2">
                    {/* Score Card with Radial Progress */}
                    <div className="relative flex flex-col items-center justify-center rounded-lg border border-white/20 bg-white/10 p-3 shadow-sm backdrop-blur-md transition-all hover:bg-white/15">
                        <RadialProgress rating={feedback.rating || 0} size={95} />
                        <div className="text-accent mt-2 text-center text-[10px] font-bold tracking-tight uppercase">
                            {getMentorVerdict()}
                        </div>
                    </div>

                    {/* Time Complexity Card */}
                    <div className="flex flex-col items-center justify-center rounded-lg border border-white/20 bg-white/10 p-3 shadow-sm backdrop-blur-md transition-all hover:bg-white/15">
                        <div className="text-text-muted mb-1 flex items-center gap-1 text-[9px] font-bold tracking-tight uppercase">
                            <Gauge size={10} /> Time
                        </div>
                        <div className="text-accent mb-1 font-mono text-base font-black tracking-tight">
                            {feedback.complexities?.time || feedback.timeComplexity || 'O(N)'}
                        </div>
                        <div className="text-text-muted text-center text-[10px] leading-tight">
                            {feedback.algorithm || 'Algorithm'}
                        </div>
                    </div>

                    {/* Space Complexity Card */}
                    <div className="flex flex-col items-center justify-center rounded-lg border border-white/20 bg-white/10 p-3 shadow-sm backdrop-blur-md transition-all hover:bg-white/15">
                        <div className="text-text-muted mb-1 flex items-center gap-1 text-[9px] font-bold tracking-tight uppercase">
                            <Cpu size={10} /> Space
                        </div>
                        <div className="text-accent mb-1 font-mono text-base font-black tracking-tight">
                            {feedback.complexities?.space || feedback.spaceComplexity || 'O(1)'}
                        </div>
                        <div className="text-text-muted text-center text-[10px] leading-tight">
                            Memory Usage
                        </div>
                    </div>
                </div>

                {/* 2a. Verdict Badge (ACCEPTED/FAILED/TLE) */}
                {verdictStatus && (
                    <div
                        className={`rounded-lg border-2 p-4 text-center shadow-md ${
                            verdictStatus.includes('ACCEPTED')
                                ? 'bg-success/10 border-success/40'
                                : verdictStatus.includes('TIME') || verdictStatus.includes('MEMORY')
                                  ? 'border-amber-500/40 bg-amber-500/10'
                                  : 'bg-error/10 border-error/40'
                        }`}
                    >
                        <div
                            className={`mb-2 text-[14px] font-black tracking-widest ${
                                verdictStatus.includes('ACCEPTED')
                                    ? 'text-success'
                                    : verdictStatus.includes('TIME') ||
                                        verdictStatus.includes('MEMORY')
                                      ? 'text-amber-600'
                                      : 'text-error'
                            }`}
                        >
                            {verdictStatus.includes('ACCEPTED')
                                ? '✓ ACCEPTED'
                                : verdictStatus.includes('WRONG')
                                  ? '✗ WRONG ANSWER'
                                  : verdictStatus.includes('RUNTIME')
                                    ? '✗ RUNTIME ERROR'
                                    : verdictStatus.includes('TIME')
                                      ? '⏱ TIME LIMIT EXCEEDED'
                                      : verdictStatus.includes('MEMORY')
                                        ? '🔴 MEMORY LIMIT'
                                        : '⚠️ ' + verdictStatus}
                        </div>
                        {feedback.verdict_explanation && (
                            <div className="text-text-secondary text-[12px] leading-relaxed">
                                {formatText(feedback.verdict_explanation)}
                            </div>
                        )}
                    </div>
                )}

                {/* 3a. Optimal Strategy (if not failing) */}
                {feedback.optimal_approach && !feedback.critical_flaws?.length && (
                    <div className="bg-accent/10 border-accent/30 rounded-lg border p-3 shadow-sm">
                        <div className="mb-2 flex items-center gap-1.5">
                            <Award size={13} className="text-accent" />
                            <h3 className="text-accent text-[12px] font-bold tracking-tight uppercase">
                                Optimal Strategy
                            </h3>
                        </div>
                        <div className="text-text-secondary text-[13px] leading-relaxed">
                            {formatText(feedback.optimal_approach)}
                        </div>
                    </div>
                )}
                {feedback.critical_flaws && feedback.critical_flaws.length > 0 && (
                    <div className="border-error/50 bg-error/8 space-y-3 rounded-lg border-2 p-4 shadow-md">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={16} className="text-error animate-pulse" />
                            <h3 className="text-error text-[13px] font-black tracking-tight uppercase">
                                Things to Fix
                            </h3>
                        </div>
                        <ul className="space-y-2">
                            {feedback.critical_flaws.map((flaw, i) => (
                                <li
                                    key={i}
                                    className="bg-error/10 border-error/40 border-error text-error/90 flex gap-2.5 rounded-lg border-l-3 py-2 pl-3 text-[12px] leading-relaxed"
                                >
                                    <Flame size={13} className="text-error/70 mt-0.5 shrink-0" />
                                    <span className="font-medium">{formatText(flaw)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* 4. Socratic Hints */}
                {feedback.hints && feedback.hints.length > 0 && (
                    <div className="space-y-2">
                        <div className="border-border/30 flex items-center gap-1.5 border-b pb-1.5">
                            <Lightbulb size={12} className="text-accent" />
                            <h3 className="text-text-secondary text-[12px] font-bold tracking-tight uppercase">
                                Hints
                            </h3>
                        </div>
                        <div className="space-y-1.5">
                            {feedback.hints.map((hint, i) => (
                                <Accordion key={i} title={`Hint ${i + 1}`} defaultOpen={i === 0}>
                                    <div className="text-[13px] leading-relaxed">
                                        {formatText(hint)}
                                    </div>
                                </Accordion>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. Code Strengths */}
                {feedback.strengths && feedback.strengths.length > 0 && (
                    <div className="space-y-2">
                        <div className="border-border/30 flex items-center gap-1.5 border-b pb-1.5">
                            <CheckCircle2 size={12} className="text-success" />
                            <h3 className="text-text-secondary text-[12px] font-bold tracking-tight uppercase">
                                Strengths
                            </h3>
                        </div>
                        <div className="grid gap-1.5">
                            {feedback.strengths.map((strength, i) => (
                                <div
                                    key={i}
                                    className="bg-success/5 border-success/20 text-success/80 flex gap-2 rounded border px-2.5 py-1.5 text-[12px] leading-snug"
                                >
                                    <Check size={11} className="mt-0.5 shrink-0" />
                                    <span>{formatText(strength)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 6. Quality Radar Chart */}
                <div className="border-border/30 space-y-3 rounded-lg border bg-white/10 p-4 shadow-sm backdrop-blur-md">
                    <div className="flex items-center gap-1.5">
                        <Code2 size={13} className="text-accent" />
                        <h3 className="text-text-secondary text-[12px] font-bold tracking-tight uppercase">
                            Quality Profile
                        </h3>
                    </div>
                    <div className="flex justify-center">
                        <RadarChart
                            correctness={logicScore}
                            efficiency={effScore}
                            readability={readScore}
                            size={130}
                            verdict={verdictStatus || ''}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
