'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Crown, Trophy, Medal, Zap, CheckCircle2 } from 'lucide-react'

/* ─────────────────────────────────────────────────────────
 * DESIGN NOTES — Compact Vercel-minimal aesthetic
 * ─────────────────────────────────────────────────────────
 * NO cards, NO badges, NO chrome.
 * Just: avatar → name → stats → podium bar.
 * Height hierarchy is PHYSICAL: #1 tallest, #2/#3 shorter.
 * Visual weight = rank importance.
 * ───────────────────────────────────────────────────────── */

/**
 * Animated counter (counts up on mount) - Matched to PlatformStats
 */
function AnimatedValue({ value, delay = 0 }) {
    const [display, setDisplay] = useState(0)
    const rafRef = useRef(null)

    useEffect(() => {
        const duration = 900
        let start = null

        const animate = (ts) => {
            if (!start) start = ts
            const elapsed = ts - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(2, -10 * progress)

            setDisplay(Math.round(eased * value))

            if (progress < 1) rafRef.current = requestAnimationFrame(animate)
        }

        const timer = setTimeout(() => {
            rafRef.current = requestAnimationFrame(animate)
        }, delay)

        return () => {
            clearTimeout(timer)
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [value, delay])

    return <>{display.toLocaleString()}</>
}

/**
 * Individual podium position.
 */
function PodiumPosition({ entry, rank, delay }) {
    const config = {
        1: {
            avatarSize: 'w-24 h-24',
            nameSize: 'text-lg',
            statsSize: 'text-xs',
            barHeight: 'h-44',
            BarIcon: Trophy,
            barIconSize: 40,
            color: 'var(--color-rank-gold)',
            badge: '#1 Champion',
        },
        2: {
            avatarSize: 'w-20 h-20',
            nameSize: 'text-base',
            statsSize: 'text-xs',
            barHeight: 'h-28',
            BarIcon: Medal,
            barIconSize: 32,
            color: 'var(--color-rank-silver)',
            badge: '#2',
        },
        3: {
            avatarSize: 'w-20 h-20',
            nameSize: 'text-base',
            statsSize: 'text-xs',
            barHeight: 'h-20',
            BarIcon: Medal,
            barIconSize: 28,
            color: 'var(--color-rank-bronze)',
            badge: '#3',
        },
    }

    const c = config[rank]
    const BarIcon = c.BarIcon

    return (
        <div
            className="animate-fade-up flex flex-col items-center"
            style={{
                animationDelay: `${delay}ms`,
            }}
        >
            {/* Avatar + badge */}
            <div className="relative mb-4">
                {/* Crown icon for #1 only */}
                {rank === 1 && (
                    <div
                        className="absolute -top-6 left-1/2 -translate-x-1/2"
                        style={{ color: c.color }}
                    >
                        <Crown size={32} strokeWidth={2.5} className="drop-shadow-sm" />
                    </div>
                )}

                {/* Avatar */}
                <Avatar
                    className={`${c.avatarSize} border-2 ${rank === 1 ? 'animate-soft-pulse shadow-md' : ''} bg-bg-page`}
                    style={{
                        borderColor: c.color,
                        padding: '2px',
                    }}
                >
                    <AvatarImage
                        src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${entry.userId.username}`}
                        alt={entry.userId.username}
                    />
                    <AvatarFallback
                        className="text-xl font-semibold"
                        style={{
                            background: `${c.color}20`,
                            color: c.color,
                        }}
                    >
                        {entry.userId.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                {/* Badge label below avatar */}
                <span
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-medium whitespace-nowrap shadow-sm"
                    style={{
                        background: c.color,
                        color: '#FFFFFF',
                    }}
                >
                    {c.badge}
                </span>
            </div>

            {/* Name */}
            <Link href={`/profile/${entry.userId._id}`}>
                <p
                    className={`${c.nameSize} font-display hover:text-accent mb-1 cursor-pointer text-center font-semibold tracking-tight transition-colors`}
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    {entry.userId.username}
                </p>
            </Link>

            {/* Stats (compact, single line) - Styled like PlatformStats */}
            <div className="mb-4 flex items-center gap-3">
                <div className="flex items-center gap-1.5" title="Total Points">
                    <Zap size={12} className="text-amber-500" fill="currentColor" />
                    <span className="text-text-primary font-mono text-sm font-semibold">
                        <AnimatedValue value={entry.score} delay={delay + 100} />
                    </span>
                    <span className="text-text-muted text-[10px] font-medium tracking-wider uppercase">
                        score
                    </span>
                </div>
                <div className="bg-border h-3 w-px" />
                <div className="flex items-center gap-1.5" title="Problems Solved">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span className="text-text-primary font-mono text-sm font-semibold">
                        <AnimatedValue value={entry.submissions} delay={delay + 150} />
                    </span>
                </div>
            </div>

            {/* Podium bar (physical height difference) */}
            <div
                className={`w-full ${c.barHeight} group relative flex items-start justify-center overflow-hidden rounded-t-xl border-x border-t pt-4`}
                style={{
                    borderColor: `${c.color}40`,
                    background: `linear-gradient(180deg, ${c.color}15 0%, ${c.color}05 100%)`,
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <BarIcon
                    size={c.barIconSize}
                    className="opacity-20 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-30"
                    style={{ color: c.color }}
                    strokeWidth={1.5}
                />
            </div>
        </div>
    )
}

/* ── Public Component ────────────────────────────────────── */

/**
 * @component TopThreePodium
 * @description Compact podium for top 3 competitors.
 *
 * Design:
 * - Minimal — no cards, no badges, no chrome
 * - Hierarchy through HEIGHT: #1 tallest (h-44), #2 medium (h-28), #3 shortest (h-20)
 * - Desktop: 2-1-3 order (silver, gold, bronze)
 * - Mobile: 1 full width, then 2+3 side-by-side
 * - Staggered entrance animation
 *
 * Design tokens used:
 *   --color-rank-gold, --color-rank-silver, --color-rank-bronze,
 *   --color-text-primary, --color-text-muted, --color-text-inverse
 *
 * @returns {JSX.Element}
 */
export function TopThreePodium({ users = [] }) {
    const [first, second, third] = users

    return (
        <section className="my-12 md:my-16" aria-label="Top 3 competitors">
            {/* ── DESKTOP: 2-1-3 podium layout ────────────────── */}
            <div className="mx-auto hidden max-w-4xl items-end gap-6 px-8 md:grid md:grid-cols-3 md:px-16">
                {/* #2 Silver — left, shorter */}
                <PodiumPosition entry={second} rank={2} delay={100} />

                {/* #1 Gold — centre, tallest */}
                <PodiumPosition entry={first} rank={1} delay={0} />

                {/* #3 Bronze — right, shortest */}
                <PodiumPosition entry={third} rank={3} delay={200} />
            </div>

            {/* ── MOBILE: 1st full, 2nd/3rd grid ──────────────── */}
            <div className="space-y-4 md:hidden">
                {/* #1 Gold — full width */}
                <PodiumPosition entry={first} rank={1} delay={0} />

                {/* #2 + #3 — side by side */}
                <div className="grid grid-cols-2 gap-3">
                    <PodiumPosition entry={second} rank={2} delay={100} />
                    <PodiumPosition entry={third} rank={3} delay={200} />
                </div>
            </div>
        </section>
    )
}
