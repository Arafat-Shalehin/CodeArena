'use client';

import { useAuth } from '@/context/AuthContext';
import { getStatsData } from '../data/stats.data';

/**
 * @component ProblemStats
 * @description Displays a donut chart and progress bars showing the user's
 * problem-solving statistics broken down by difficulty (Easy, Medium, Hard).
 * Values are derived from the logged-in user's `stats.problemsSolved`.
 * @param {Object} props
 * @param {Object} [props.user] - Optional user data override (for public profiles).
 * @returns {JSX.Element} The rendered problem stats section.
 */
export default function ProblemStats({ user: userProp }) {
  const { user: authUser } = useAuth();
  const displayUser = userProp || authUser;
  const statsData = getStatsData(displayUser?.stats);
  const totalSolved = statsData.reduce((acc, curr) => acc + curr.solved, 0);

  return (
    <section className="bg-bg-subtle border border-border rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-text-primary mb-6">
        Problem Stats
      </h3>

      <div className="flex items-center gap-8">
        {/* Left: Donut Chart */}
        <div className="relative h-28 w-28 shrink-0">
          <svg
            className="h-full w-full transform -rotate-90"
            viewBox="0 0 36 36"
          >
            <circle cx="18" cy="18" r="16" fill="transparent" stroke="var(--color-bg-muted)" strokeWidth="3" />
            <circle cx="18" cy="18" r="16" fill="transparent" stroke="var(--color-success)" strokeWidth="3" strokeDasharray="35 100" />
            <circle cx="18" cy="18" r="16" fill="transparent" stroke="var(--color-warning)" strokeWidth="3" strokeDasharray="45 100" strokeDashoffset="-35" />
            <circle cx="18" cy="18" r="16" fill="transparent" stroke="var(--color-error)" strokeWidth="3" strokeDasharray="20 100" strokeDashoffset="-80" />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-text-primary leading-none">
              {totalSolved}
            </span>
            <span className="text-[10px] text-text-muted uppercase font-medium tracking-wide">
              Solved
            </span>
          </div>
        </div>

        {/* Right: Progress Bars */}
        <div className="flex-1 space-y-4">
          {statsData.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className={`font-medium ${item.text}`}>{item.label}</span>
                <span className="font-bold text-text-primary">
                  {item.solved}
                </span>
              </div>
              <div className="h-1.5 w-full bg-bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${(item.solved / item.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

ProblemStats.displayName = 'ProblemStats';
