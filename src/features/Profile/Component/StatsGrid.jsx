import { status } from "../data/status.data";

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* status info */}
      {status.map((stat) => (
        <div
          key={stat.label}
          className={`bg-bg-subtle border-l-4 ${stat.border} border border-border rounded-lg p-6 shadow-sm`}
        >
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
            {stat.label}
          </p>
          <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
