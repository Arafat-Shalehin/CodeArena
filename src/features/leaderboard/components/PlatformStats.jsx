import React, { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { leaderboardStats } from '../data/leaderboard.data'

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
    'group', // Total Participants
    'upload_2', // Submissions Today
    'trophy', // Active Contests
    'check_circle', // Avg. Solve Rate
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
        ? 'var(--color-tx-muted)'
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
        ? 'var(--color-tx-muted)'
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
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                        style={{ background: 'var(--color-bg-muted)' }}
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{
                                fontSize: '16px',
                                color: 'var(--color-tx-secondary)',
                                fontVariationSettings: "'FILL' 0",
                            }}
                        >
                            {icon}
                        </span>
                    </div>
                    <p
                        className="text-xs leading-none font-semibold tracking-wider uppercase"
                        style={{ color: 'var(--color-tx-muted)' }}
                    >
                        {stat.label}
                    </p>
                </div>

                {/* Value */}
                <div
                    className="mb-3 font-mono text-2xl leading-none font-bold tracking-tight"
                    style={{ color: 'var(--color-tx-primary)' }}
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
                            <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '13px' }}
                            >
                                {isPositive ? 'trending_up' : 'trending_down'}
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

/**
 * @component PlatformStats
 * @description Displays platform-wide statistics with sparklines,
 * animated counters, trend pills, and colour-coded health indicators.
 *
 * Layout:
 * - Mobile:  2-column grid
 * - Desktop: 4-column grid
 *
 * Design tokens used (never hardcoded):
 *   --color-bg-subtle, --color-bg-muted, --color-border,
 *   --color-tx-primary, --color-tx-secondary, --color-tx-muted,
 *   --color-accent, --color-accent-light,
 *   --color-error, --color-error-light
 *
 * @returns {JSX.Element}
 */
export function PlatformStats() {
    return (
        <section aria-label="Platform statistics">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {leaderboardStats.map((stat, idx) => (
                    <StatCard
                        key={stat.label}
                        stat={stat}
                        icon={STAT_ICONS[idx]}
                        sparkline={SPARKLINES[idx]}
                        index={idx}
                    />
                ))}
            </div>
        </section>
    )
}
