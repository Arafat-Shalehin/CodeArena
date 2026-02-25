/**
 * @file dashboard.data.js
 * @description Centralized mock data and constants for the dashboard feature.
 */

/**
 * @typedef {Object} Submission
 * @property {string} time - Time since submission
 * @property {string} problem - Problem title
 * @property {string} lang - Programming language used
 * @property {string} verdict - Status of the submission
 * @property {number} score - Achievement score
 * @property {string} color - Text color class for verdict
 * @property {string} bg - Background color class for verdict
 */

/** @type {Submission[]} */
export const RECENT_SUBMISSIONS = [
    {
        time: '2 mins ago',
        problem: 'LRU Cache Implementation',
        lang: 'C++',
        verdict: 'ACCEPTED',
        score: 100,
        color: 'text-success',
        bg: 'bg-success-light',
    },
    {
        time: '1 hour ago',
        problem: 'Valid Sudoku',
        lang: 'Py',
        verdict: 'WRONG ANSWER',
        score: 45,
        color: 'text-error',
        bg: 'bg-error-light',
    },
    {
        time: '3 hours ago',
        problem: 'Median of Two Sorted Arrays',
        lang: 'C++',
        verdict: 'TLE',
        score: 82,
        color: 'text-warning',
        bg: 'bg-warning-light',
    },
    {
        time: 'Yesterday',
        problem: 'Trapping Rain Water',
        lang: 'JS',
        verdict: 'ACCEPTED',
        score: 100,
        color: 'text-success',
        bg: 'bg-success-light',
    },
]

/**
 * Generates mock intensity classes for the heatmap.
 * @returns {string[]} An array of Tailwind background color classes.
 */
export const getHeatmapData = () => {
    const intensities = ['bg-bg-muted', 'bg-accent/20', 'bg-accent/40', 'bg-accent/70', 'bg-accent']
    return Array.from({ length: 364 }, (_, i) => {
        // Randomize for demo purposes
        return intensities[Math.floor(Math.random() * (i % 20 === 0 ? 5 : 2))]
    })
}

/** @type {string[]} */
export const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
]

/**
 * @typedef {Object} Contest
 * @property {string} name - Contest name
 * @property {string} time - Time remaining or scheduled
 * @property {boolean} registered - Registration status
 */

/** @type {Contest[]} */
export const UPCOMING_CONTESTS = [
    { name: 'Starters 124 (Div 2)', time: '2h 45m', registered: false },
    { name: 'Weekly Contest 402', time: 'In 2 days', registered: true },
]
