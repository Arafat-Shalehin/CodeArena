/**
 * Generates the stats status cards from a user's stats object.
 * Matches the backend Users collection `stats` field.
 *
 * @param {Object} stats - The user's stats object from the backend.
 * @param {number} stats.totalSubmissions - Total problems solved.
 * @param {number} stats.score - Contest rating / ELO score.
 * @param {number} stats.contestsParticipated - Number of contests entered.
 * @param {number} stats.globalRank - Global leaderboard position.
 * @returns {Array<{label: string, value: string, border: string}>}
 */
export function getStatusCards(stats) {
  return [
    { label: 'Problems Solved', value: String(stats?.totalSubmissions ?? 0), border: 'border-success' },
    { label: 'Contest Rating', value: String(stats?.score ?? 0), border: 'border-accent' },
    { label: 'Participated', value: String(stats?.contestsParticipated ?? 0), border: 'border-info' },
    { label: 'Global Rank', value: `#${stats?.globalRank ?? '—'}`, border: 'border-warning' },
  ];
}

