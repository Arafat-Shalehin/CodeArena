/**
 * Generates problem stats breakdown from a user's stats object.
 * Reads from `stats.problemsSolved.{easy, medium, hard}`.
 *
 * @param {Object} stats - The user's stats object from the backend.
 * @returns {Array<{label: string, solved: number, total: number, color: string, text: string}>}
 */
export function getStatsData(stats) {
  const ps = stats?.problemsSolved ?? { easy: 0, medium: 0, hard: 0 };
  return [
    { label: 'Easy', solved: ps.easy, total: 100, color: 'bg-success', text: 'text-success' },
    { label: 'Medium', solved: ps.medium, total: 150, color: 'bg-warning', text: 'text-warning' },
    { label: 'Hard', solved: ps.hard, total: 50, color: 'bg-error', text: 'text-error' },
  ];
}

/** @deprecated Use `getStatsData(user.stats)` instead */
export const statsData = [
  { label: 'Easy', solved: 45, total: 100, color: 'bg-success', text: 'text-success' },
  { label: 'Medium', solved: 67, total: 150, color: 'bg-warning', text: 'text-warning' },
  { label: 'Hard', solved: 15, total: 50, color: 'bg-error', text: 'text-error' },
];
