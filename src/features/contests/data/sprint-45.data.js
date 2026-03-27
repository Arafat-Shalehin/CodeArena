/**
 * @typedef {Object} Prize
 * @property {string} id - Unique identifier for the prize
 * @property {string} title - Prize title (e.g., Winner)
 * @property {string} reward - Reward description
 * @property {string} rank - Rank range (e.g., Top 1)
 * @property {string} colorClass - CSS class for background color
 * @property {string} iconColor - CSS class for icon color
 */

/**
 * @typedef {Object} Participant
 * @property {string} id - Unique identifier for the participant
 * @property {string} name - Participant name
 * @property {string} avatar - Avatar URL
 */

/**
 * @typedef {Object} PastSprint
 * @property {string} id - Unique identifier for the sprint
 * @property {number} number - Sprint number
 * @property {string} date - Date string
 */

/**
 * Mock data for the Weekly Algorithm Sprint #45
 */
export const CONTEST_DATA = {
    id: 'sprint-45',
    title: 'Weekly Algorithm Sprint #45',
    description:
        'Prove your logic, optimize your code, and climb the rankings. Three challenging problems, one ultimate champion.',
    status: 'Live in 24 Hours',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    duration: '2 Hours',
    problemsCount: 3,
    difficulty: 'Easy, Med, Hard',
    languages: '20+ Languages',
    participantsCount: '1,248 Joined',
    prizes: [
        {
            id: 'prize-1',
            title: 'Winner',
            reward: 'Gold Sprint Badge + 500 XP',
            rank: 'Top 1',
            colorClass: 'bg-rank-gold/20',
            iconColor: 'text-rank-gold',
        },
        {
            id: 'prize-2',
            title: 'Top Contenders',
            reward: 'Silver Sprint Badge + 250 XP',
            rank: 'Top 10',
            colorClass: 'bg-rank-silver/20',
            iconColor: 'text-rank-silver',
        },
        {
            id: 'prize-3',
            title: 'Finalists',
            reward: 'Bronze Sprint Badge + 100 XP',
            rank: 'Top 50',
            colorClass: 'bg-rank-bronze/20',
            iconColor: 'text-rank-bronze',
        },
    ],
    participants: Array.from({ length: 8 }).map((_, i) => ({
        id: `user-${i}`,
        name: `User ${i + 1}`,
        avatar: '', // Placeholder
    })),
    pastSprints: [
        { id: 'sprint-44', number: 44, date: 'Aug 2023' },
        { id: 'sprint-43', number: 43, date: 'Aug 2023' },
        { id: 'sprint-42', number: 42, date: 'Aug 2023' },
    ],
}
