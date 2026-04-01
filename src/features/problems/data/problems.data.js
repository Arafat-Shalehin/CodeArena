/**
 * Static configuration for difficulty badge/bar styling.
 * Keys are CAPITALIZED to match the normalized display format.
 * The backend stores difficulty in lowercase; use normalizeDifficulty() before lookup.
 */
export const difficultyConfig = {
    Easy: {
        bar: 'bg-success',
        badge: 'bg-success-light text-success border-success/20',
        progress: 'bg-success',
    },
    Medium: {
        bar: 'bg-warning',
        badge: 'bg-warning-light text-warning border-warning/20',
        progress: 'bg-warning',
    },
    Hard: {
        bar: 'bg-error',
        badge: 'bg-error-light text-error border-error/20',
        progress: 'bg-error',
    },
}

/**
 * Normalizes a difficulty string from the backend (lowercase) to the capitalized
 * key used in difficultyConfig.
 * @param {string} difficulty - e.g. "easy", "medium", "hard"
 * @returns {string} - e.g. "Easy", "Medium", "Hard"
 */
export function normalizeDifficulty(difficulty) {
    if (!difficulty) return 'Medium'
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()
}

/**
 * Static topic list for the sidebar filter.
 * Topic counts will require a DB aggregation endpoint in the future.
 * These are kept as static UI placeholders for now.
 */
export const topics = [
    { name: 'Arrays', count: 450 },
    { name: 'Strings', count: 312 },
    { name: 'Dynamic Programming', count: 215 },
    { name: 'Graphs', count: 180 },
    { name: 'Trees', count: 165 },
    { name: 'Sorting', count: 120 },
]
