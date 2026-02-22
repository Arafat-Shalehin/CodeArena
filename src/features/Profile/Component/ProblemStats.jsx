// src/components/features/profile/ProblemStats.jsx

import { statsData } from "../data/stats.data";

export default function ProblemStats() {
  const totalSolved = statsData.reduce((acc, curr) => acc + curr.solved, 0);

  return (
    <section className="bg-bg-subtle border border-border rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-text-primary mb-6">
        Problem Stats
      </h3>

      <div className="flex items-center gap-8">
        {/* Left: Donut Chart Mockup */}
        <div className="relative h-28 w-28 shrink-0">
          <svg
            className="h-full w-full transform -rotate-90"
            viewBox="0 0 36 36"
          >
            {/* Background Circle */}
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="transparent"
              stroke="var(--color-bg-muted)"
              strokeWidth="3"
            />

            {/* Easy Segment (Green) */}
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="transparent"
              stroke="var(--color-success)"
              strokeWidth="3"
              strokeDasharray="35 100"
            />

            {/* Medium Segment (Yellow) */}
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="transparent"
              stroke="var(--color-warning)"
              strokeWidth="3"
              strokeDasharray="45 100"
              strokeDashoffset="-35"
            />

            {/* Hard Segment (Red) */}
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="transparent"
              stroke="var(--color-error)"
              strokeWidth="3"
              strokeDasharray="20 100"
              strokeDashoffset="-80"
            />
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
