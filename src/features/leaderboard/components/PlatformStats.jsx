import React, { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { leaderboardStats } from '../data/leaderboard.data'
import { Users, Upload, Trophy, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react'

/* ─────────────────────────────────────────────────────────
 * DESIGN NOTES
 * ─────────────────────────────────────────────────────────
 * Visual language: Vercel-precision + HackerRank-energy.
 * Every card tells a story: icon → value → delta → spark.
 * Colour codes the emotion: green = good, red = concern,
 * muted = neutral. Nothing is decorative without purpose.
 * ───────────────────────────────────────────────────────── */

/**
 * Maps stat index → icon name (Material Symbols).
 * Keep in sync with leaderboardStats array order.
 */
const STAT_ICONS = [
    <Users key="users" size={16} />,
    <Upload key="upload" size={16} />,
    <Trophy key="trophy" size={16} />,
    <CheckCircle key="check" size={16} />,
]

/**
 * Fake sparkline data per stat (last 7 readings, normalised 0–1).
 * Replace with real data from your API.
 */
const SPARKLINES = [
    [0.55, 0.6, 0.58, 0.7, 0.66, 0.75, 0.8], // Participants – growing
    [0.4, 0.55, 0.72, 0.6, 0.88, 0.76, 0.92], // Submissions – volatile, peaking
    [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8], // Contests – flat / stable
    [0.72, 0.7, 0.69, 0.68, 0.67, 0.69, 0.68], // Solve rate – slight decline
]

/* ── Tiny SVG Sparkline ──────────────────────────────────── */
function Sparkline({ data, positive, stable }) {
    const width = 64
    const height = 24
    const pad = 2
    const w = width - pad * 2
    const h = height - pad * 2

    const points = data
        .map((v, i) => {
            const x = pad + (i / (data.length - 1)) * w
            const y = pad + (1 - v) * h
            return `${x},${y}`
        })
        .join(' ')

    // Area fill path
    const first = `${pad},${pad + (1 - data[0]) * h}`
    const last = `${pad + w},${pad + (1 - data[data.length - 1]) * h}`
    const area = `M ${first} L ${points.split(' ').join(' L ')} L ${last} L ${pad + w},${pad + h} L ${pad},${pad + h} Z`

    const color = stable
        ? 'var(--color-text-muted)'
        : positive
          ? 'var(--color-accent)'
          : 'var(--color-error)'

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            fill="none"
            aria-hidden="true"
        >
            {/* Area fill */}
            <path d={area} fill={color} opacity="0.10" />
            {/* Line */}
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Terminal dot */}
            <circle cx={pad + w} cy={pad + (1 - data[data.length - 1]) * h} r="2.5" fill={color} />
        </svg>
    )
}

/* ── Animated counter (counts up on mount) ───────────────── */
function AnimatedValue({ raw, delay = 0 }) {
    // raw could be "124,032" or "68.5%" – strip non-numeric for animation
    const [display, setDisplay] = useState('0')
    const rafRef = useRef(null)

    useEffect(() => {
        // Trim commas / % to get a number
        const numeric = parseFloat(raw.replace(/,/g, ''))
        const isPercent = raw.includes('%')
        const hasComma = raw.includes(',')
        const duration = 900 // ms
        let start = null

        const animate = (ts) => {
            if (!start) start = ts
            const elapsed = ts - start
            const progress = Math.min(elapsed / duration, 1)
            // Ease out expo
            const eased = 1 - Math.pow(2, -10 * progress)
            const current = eased * numeric

            let formatted
            if (isPercent) {
                formatted = current.toFixed(1) + '%'
            } else if (hasComma) {
                formatted = Math.round(current).toLocaleString()
            } else {
                formatted = String(Math.round(current))
            }

            setDisplay(formatted)
            if (progress < 1) rafRef.current = requestAnimationFrame(animate)
        }

        const timer = setTimeout(() => {
            rafRef.current = requestAnimationFrame(animate)
        }, delay)

        return () => {
            clearTimeout(timer)
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [raw, delay])

    return <span>{display}</span>
}

/* ── Individual Stat Card ────────────────────────────────── */
function StatCard({ stat, icon, sparkline, index }) {
    const isPositive = stat.trendUp === true
    const isNegative = stat.trendUp === false
    const isStable = stat.trendUp === null

    // Left border colour communicates health at a glance
    const accentVar = isStable
        ? 'var(--color-border)'
        : isPositive
          ? 'var(--color-accent)'
          : 'var(--color-error)'

    const trendColour = isStable
        ? 'var(--color-text-muted)'
        : isPositive
          ? 'var(--color-accent)'
          : 'var(--color-error)'

    const trendBg = isStable
        ? 'var(--color-bg-muted)'
        : isPositive
          ? 'var(--color-accent-light)'
          : 'var(--color-error-light)'

    return (
        <Card
            className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
            style={{
                padding: 0,
                background: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                animationDelay: `${index * 60}ms`,
            }}
        >
            {/* Left accent bar — colour-coded health indicator */}
            <div
                className="absolute inset-y-0 left-0 w-[3px] transition-colors duration-200"
                style={{ background: accentVar }}
                aria-hidden="true"
            />

            {/* Hover shimmer — ultra-subtle */}
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background:
                        'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 60%)',
                }}
                aria-hidden="true"
            />

            {/* Card body */}
            <div className="pt-4 pr-4 pb-4 pl-5">
                {/* Top row: icon + label */}
                <div className="mb-3 flex items-center gap-2">
                    <div
                        className="text-text-secondary flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                        style={{ background: 'var(--color-bg-muted)' }}
                    >
                        {icon}
                    </div>
                    <p
                        className="text-xs leading-none font-semibold tracking-wider uppercase"
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        {stat.label}
                    </p>
                </div>

                {/* Value */}
                <div
                    className="mb-3 font-mono text-2xl leading-none font-bold tracking-tight"
                    style={{ color: 'var(--color-text-primary)' }}
                    aria-label={`${stat.label}: ${stat.value}`}
                >
                    <AnimatedValue raw={stat.value} delay={index * 60 + 100} />
                </div>

                {/* Bottom row: trend pill + sparkline */}
                <div className="flex items-end justify-between gap-2">
                    {/* Trend pill */}
                    <div
                        className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ background: trendBg, color: trendColour }}
                    >
                        {!isStable && (
                            <span className="flex items-center">
                                {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                            </span>
                        )}
                        <span>{stat.trend}</span>
                    </div>

                    {/* Sparkline */}
                    <Sparkline data={sparkline} positive={isPositive} stable={isStable} />
                </div>
            </div>
        </Card>
    )
}

/* ── Public Component ────────────────────────────────────── */

export function PlatformStats() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    console.log(stats)
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/stats/platform')
                const json = await res.json()
                // console.log(json)
                if (json.success) {
                    const mappedStats = [
                        {
                            label: 'Total Participants',
                            value: json.data.totalParticipants.toLocaleString(),
                            trend: `${json.data.participantsTrend >= 0 ? '+' : ''}${json.data.participantsTrend}%`,
                            trendUp: json.data.participantsTrendUp,
                            history: json.data.participantsHistory,
                        },
                        {
                            label: 'Submissions Today',
                            value: json.data.submissionsToday.toLocaleString(),
                            trend: `${json.data.submissionsTrend >= 0 ? '+' : ''}${json.data.submissionsTrend}%`,
                            trendUp: json.data.submissionsTrendUp,
                            history: json.data.submissionsHistory,
                        },
                        {
                            label: 'Active Contests',
                            value: json.data.activeContests.toString(),
                            trend: `${json.data.contestsTrend >= 0 ? '+' : ''}${json.data.contestsTrend}%`,
                            trendUp: json.data.contestsTrendUp,
                            history: json.data.contestsHistory,
                        },
                        {
                            label: 'Avg. Solve Rate',
                            value: json.data.avgSolveRate,
                            trend: `${json.data.solveRateTrend >= 0 ? '+' : ''}${json.data.solveRateTrend}%`,
                            trendUp: json.data.solveRateTrendUp,
                            history: json.data.solveRateHistory,
                        },
                    ]
                    setStats(mappedStats)
                }
            } catch (err) {
                console.error('[PlatformStats] Failed to fetch stats:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading || !stats) {
        return (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-bg-subtle border-border h-32 animate-pulse rounded-xl border"
                    />
                ))}
            </div>
        )
    }

    return (
        <section aria-label="Platform statistics">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {stats.map((stat, idx) => (
                    <StatCard
                        key={stat.label}
                        stat={stat}
                        icon={STAT_ICONS[idx]}
                        sparkline={stat.history}
                        index={idx}
                    />
                ))}
            </div>
        </section>
    )
}
