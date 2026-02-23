'use client'

/**
 * @component ContestPerformance
 * @description Displays contest performance stats (Best Rank, Avg Rank) and
 * a bar chart showing rating trend over the last 10 contests.
 *
 * @returns {JSX.Element} The rendered contest performance section.
 */

/** Mock rating trend data (percentage heights) */
const RATING_TREND = [40, 30, 55, 45, 70, 60, 85, 75, 95]

export default function ContestPerformance({ performance }) {
    // If performance prop is omitted or mostly empty, show empty state or hide
    if (
        !performance ||
        (!performance.bestRank &&
            !performance.avgRank &&
            (!performance.ratingTrend || performance.ratingTrend.length === 0))
    ) {
        return null
    }

    return (
        <section className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
            <h3 className="text-text-primary mb-6 text-lg font-semibold">Contest Performance</h3>

            {/* Best & Avg Rank Stats */}
            <div className="mb-8 grid grid-cols-2 gap-4">
                <div className="bg-bg-muted/30 border-border/50 rounded-lg border p-4">
                    <p className="text-text-muted mb-1 text-[10px] font-bold tracking-widest uppercase">
                        Best Rank
                    </p>
                    <p className="text-text-primary text-2xl font-bold">
                        {performance.bestRank ? `#${performance.bestRank}` : '—'}
                    </p>
                </div>
                <div className="bg-bg-muted/30 border-border/50 rounded-lg border p-4">
                    <p className="text-text-muted mb-1 text-[10px] font-bold tracking-widest uppercase">
                        Avg Rank
                    </p>
                    <p className="text-text-primary text-2xl font-bold">
                        {performance.avgRank ? `#${performance.avgRank}` : '—'}
                    </p>
                </div>
            </div>

            {/* Rating Trend Bar Chart */}
            {performance.ratingTrend && performance.ratingTrend.length > 0 ? (
                <div className="relative">
                    <div className="flex h-24 w-full items-end gap-1.5 px-1">
                        {performance.ratingTrend.map((height, index) => (
                            <div
                                key={index}
                                className="bg-accent/20 hover:bg-accent group relative flex-1 cursor-pointer rounded-t-sm transition-all duration-300"
                                style={{ height: `${height}%` }}
                            >
                                {/* Tooltip on hover */}
                                <div className="bg-text-primary text-bg-page absolute -top-8 left-1/2 z-10 -translate-x-1/2 rounded px-2 py-1 text-[10px] whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
                                    Rank: #{100 - height}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Label */}
                    <p className="text-text-muted mt-4 text-center text-[10px] font-medium tracking-tighter uppercase">
                        Rating Trend (Last 10 Contests)
                    </p>
                </div>
            ) : (
                <p className="text-text-muted py-4 text-center text-sm">No recent contests</p>
            )}
        </section>
    )
}

ContestPerformance.displayName = 'ContestPerformance'
