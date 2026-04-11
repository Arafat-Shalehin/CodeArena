'use client'

import React from 'react'
import Link from 'next/link'
import PropTypes from 'prop-types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Activity, Flame, CheckCircle, ArrowRight } from 'lucide-react'
import { formatAcceptanceRate, cn } from '@/lib/utils'

/**
 * @constant DIFFICULTY_CONFIG
 * @description Configuration for difficulty visualization (color & icon).
 */
const DIFFICULTY_CONFIG = {
    easy: {
        variant: 'success',
        icon: Zap,
        color: 'text-success',
        bg: 'bg-success-light',
        border: 'border-success/30',
    },
    medium: {
        variant: 'warning',
        icon: Activity,
        color: 'text-warning',
        bg: 'bg-warning-light',
        border: 'border-warning/30',
    },
    hard: {
        variant: 'destructive',
        icon: Flame,
        color: 'text-error',
        bg: 'bg-error-light',
        border: 'border-error/30',
    },
}

const TAG_BASE = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium'

const TAG_VARIANTS = {
    highlight: `${TAG_BASE} bg-accent-light text-accent-text`,
    default: `${TAG_BASE} bg-bg-muted text-text-secondary`,
}

/**
 * Unified Problem Card component.
 * Supports multiple variants for different sections of the application.
 *
 * @param {Object} props
 * @param {Object} props.problem - Problem data object
 * @param {'detailed' | 'simple'} [props.variant='detailed'] - Visual style variant
 * @param {string[]} [props.highlightTags=[]] - Tags to visually highlight (simple variant)
 * @param {string} [props.badge] - Optional ribbon badge (simple variant)
 * @param {string} [props.className] - Additional classes
 */
export default function ProblemCard({
    problem,
    variant = 'detailed',
    highlightTags = [],
    badge,
    className,
}) {
    const { _id, title, difficulty, acceptedSubmissions, tags, acceptanceRate } = problem
    const diff = difficulty?.toLowerCase() || 'easy'
    const config = DIFFICULTY_CONFIG[diff] || DIFFICULTY_CONFIG.easy
    const Icon = config.icon

    // --- Detailed Variant (Home Page Style) ---
    if (variant === 'detailed') {
        return (
            <Link
                href={`/problems/${_id}`}
                className={cn('group relative block h-full', className)}
            >
                <Card className="matte-surface bg-bg-subtle/50 border-border hover:border-accent/50 relative h-full cursor-pointer overflow-hidden rounded-2xl p-0 shadow-sm transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    {/* Background Detail: Grid Pattern */}
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--ca-border-rgb),0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--ca-border-rgb),0.1)_1px,transparent_1px)] bg-size-[24px_24px] opacity-10" />

                    {/* Hover Spotlight */}
                    <div className="from-accent/5 pointer-events-none absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <CardContent className="relative z-10 flex h-full flex-col p-6">
                        <div className="mb-4 flex items-start justify-between">
                            <Badge
                                variant="outline"
                                className={cn(
                                    'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-colors duration-300',
                                    config.bg,
                                    config.color,
                                    config.border
                                )}
                            >
                                <Icon className="size-2.5" strokeWidth={3} aria-hidden="true" />
                                {difficulty}
                            </Badge>
                            <div className="text-text-muted flex items-center gap-1.5 text-[10px] font-bold tracking-tight">
                                <CheckCircle className="size-3 opacity-60" aria-hidden="true" />
                                {acceptedSubmissions?.toLocaleString() || 0}
                            </div>
                        </div>

                        <h3 className="text-text-primary group-hover:text-accent font-display mb-3 line-clamp-2 text-xl leading-tight font-black tracking-tight transition-colors duration-300">
                            {title}
                        </h3>

                        <div className="mb-5 flex flex-wrap gap-1.5">
                            {tags?.slice(0, 3).map((tag, i) => (
                                <span
                                    key={i}
                                    className="bg-bg-muted/80 text-text-secondary hover:bg-border/60 hover:text-text-primary rounded-md px-2 py-0.5 text-[9px] font-bold tracking-wide transition-all duration-300"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="border-border/60 mt-auto flex items-center justify-between border-t pt-4">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-text-muted text-[9px] font-bold tracking-wider uppercase">
                                    Acceptance
                                </span>
                                <span className="text-text-primary text-xs font-black italic">
                                    {formatAcceptanceRate(acceptanceRate)}
                                </span>
                            </div>
                            <div className="bg-bg-muted/50 group-hover:bg-accent/10 border-border group-hover:border-accent/30 flex size-8 items-center justify-center rounded-lg border transition-all duration-300 group-hover:scale-110">
                                <ArrowRight
                                    className="text-text-muted group-hover:text-accent size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                                    aria-hidden="true"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        )
    }

    // --- Simple Variant (Profile/Recommendations Style) ---
    return (
        <Link
            href={`/problems/${_id}`}
            className={cn(
                'bg-bg-page border-border duration-normal group relative flex flex-col justify-between rounded-lg border p-4 shadow-sm transition-shadow hover:shadow',
                className
            )}
        >
            {badge && (
                <span className="bg-accent absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    {badge}
                </span>
            )}
            <div>
                <div className="mb-2 flex items-start justify-between">
                    <h4 className="text-text-primary group-hover:text-accent line-clamp-1 text-sm font-semibold transition-colors">
                        {title}
                    </h4>
                    <span
                        className={cn(
                            'ml-2 inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-tight uppercase',
                            config.bg,
                            config.color
                        )}
                    >
                        {difficulty}
                    </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                    {tags &&
                        tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className={
                                    highlightTags.includes(tag)
                                        ? TAG_VARIANTS.highlight
                                        : TAG_VARIANTS.default
                                }
                            >
                                {tag}
                            </span>
                        ))}
                    {tags?.length > 3 && (
                        <span className={TAG_VARIANTS.default}>+{tags.length - 3}</span>
                    )}
                </div>
            </div>

            <div className="text-text-muted mt-4 flex items-center justify-between text-[10px] font-bold tracking-wider uppercase">
                <span>{formatAcceptanceRate(acceptanceRate)} Acceptance</span>
                <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
        </Link>
    )
}

ProblemCard.propTypes = {
    problem: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        difficulty: PropTypes.string.isRequired,
        acceptedSubmissions: PropTypes.number,
        tags: PropTypes.arrayOf(PropTypes.string),
        acceptanceRate: PropTypes.number,
    }).isRequired,
    variant: PropTypes.oneOf(['detailed', 'simple']),
    highlightTags: PropTypes.arrayOf(PropTypes.string),
    badge: PropTypes.string,
    className: PropTypes.string,
}
