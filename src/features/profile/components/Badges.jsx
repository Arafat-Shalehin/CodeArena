'use client'

import { Hexagon } from 'lucide-react'

/**
 * @component Badges
 * @description Displays a summary of user badges and the next locked badge.
 * Matches the provided design system tokens and reference image.
 *
 * @returns {JSX.Element} The rendered Badges section.
 */
export default function Badges({ badgeCount = 0, nextBadge = 'Mar LeetCoding Challenge' }) {
    return (
        <section className="bg-bg-subtle border-border relative flex min-h-[160px] flex-col justify-between overflow-hidden rounded-2xl border p-6 shadow-sm">
            {/* Background Hexagon Icon (Decorative) */}
            <div className="text-bg-muted/30 absolute top-1/2 right-4 -translate-y-1/2">
                <Hexagon size={80} strokeWidth={1} />
                <div className="absolute inset-0 flex flex-col items-center justify-center -space-y-1">
                    <span className="text-bg-muted/40 font-sans text-xl font-bold">3</span>
                    <span className="text-bg-muted/40 font-sans text-[10px] font-bold uppercase">
                        Mar
                    </span>
                </div>
            </div>

            {/* Badges Summary */}
            <div className="relative z-10">
                <p className="text-text-muted mb-1 text-xs font-medium tracking-wide uppercase">
                    Badges
                </p>
                <h3 className="text-text-primary text-3xl font-bold">{badgeCount}</h3>
            </div>

            {/* Next Locked Badge info */}
            <div className="relative z-10">
                <p className="text-text-muted mb-1 text-xs font-medium tracking-wide uppercase">
                    Locked Badge
                </p>
                <p className="text-text-primary text-sm font-semibold">{nextBadge}</p>
            </div>
        </section>
    )
}

Badges.displayName = 'Badges'
