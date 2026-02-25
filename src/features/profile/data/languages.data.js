/**
 * Profile Mock Data — Languages
 *
 * Language usage statistics for the user profile.
 * Drives the Languages section in the profile page.
 */

/**
 * Returns the user's language usage statistics as an array,
 * sorted by percentage descending.
 *
 * @param {Object} stats - The user's stats object from the backend
 * @returns {Array<{language: string, percentage: number}>}
 */
export function getLanguageStats(stats) {
    if (!stats?.languageStats || Object.keys(stats.languageStats).length === 0) {
        return []
    }

    // Assuming backend stores languageStats as { "JavaScript": 60, "Python": 15, etc }
    const languages = Object.entries(stats.languageStats).map(([language, percentage]) => ({
        language,
        percentage,
    }))

    return languages.sort((a, b) => b.percentage - a.percentage)
}
