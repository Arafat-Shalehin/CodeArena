'use client';

/**
 * @component ContestPerformance
 * @description Displays contest performance stats (Best Rank, Avg Rank) and
 * a bar chart showing rating trend over the last 10 contests.
 *
 * @returns {JSX.Element} The rendered contest performance section.
 */

/** Mock rating trend data (percentage heights) */
const RATING_TREND = [40, 30, 55, 45, 70, 60, 85, 75, 95];

export default function ContestPerformance({ performance }) {
  // If performance prop is omitted or mostly empty, show empty state or hide
  if (!performance || (!performance.bestRank && !performance.avgRank && (!performance.ratingTrend || performance.ratingTrend.length === 0))) {
    return null;
  }

  return (
    <section className="bg-bg-subtle border border-border rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-text-primary mb-6">
        Contest Performance
      </h3>

      {/* Best & Avg Rank Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-bg-muted/30 border border-border/50">
          <p className="text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1">
            Best Rank
          </p>
          <p className="text-2xl font-bold text-text-primary">
            {performance.bestRank ? `#${performance.bestRank}` : '—'}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-bg-muted/30 border border-border/50">
          <p className="text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1">
            Avg Rank
          </p>
          <p className="text-2xl font-bold text-text-primary">
            {performance.avgRank ? `#${performance.avgRank}` : '—'}
          </p>
        </div>
      </div>

      {/* Rating Trend Bar Chart */}
      {performance.ratingTrend && performance.ratingTrend.length > 0 ? (
        <div className="relative">
          <div className="h-24 w-full flex items-end gap-1.5 px-1">
            {performance.ratingTrend.map((height, index) => (
              <div
                key={index}
                className="flex-1 bg-accent/20 hover:bg-accent transition-all duration-300 rounded-t-sm cursor-pointer group relative"
                style={{ height: `${height}%` }}
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-primary text-bg-page text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  Rank: #{100 - height}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Label */}
          <p className="text-center text-[10px] text-text-muted mt-4 font-medium uppercase tracking-tighter">
            Rating Trend (Last 10 Contests)
          </p>
        </div>
      ) : (
        <p className="text-sm text-text-muted text-center py-4">No recent contests</p>
      )}
    </section>
  );
}

ContestPerformance.displayName = 'ContestPerformance';
