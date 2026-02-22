/**
 * Centralized Mock User Data
 *
 * Single source of truth for the demo user, matching the backend Users
 * collection schema from backend-data-modelling.md:
 *
 *   _id, email, name, role, stats, createdAt
 *
 * All profile components and the AuthContext consume this object so that
 * stats remain consistent across the leaderboard, profile page, and navbar.
 */

export const DEMO_USER = {
    _id: 'u_demo',
    name: 'Rabiul Islam',
    username: 'rabiul_codes',
    avatarSeed: 'rabiul_codes',
    email: 'codearena@gmail.com',
    role: 'user',
    stats: {
        totalSubmissions: 127,
        score: 1850,
        contestsParticipated: 23,
        globalRank: 342,
        problemsSolved: {
            easy: 45,
            medium: 67,
            hard: 15,
        },
    },
    createdAt: '2025-06-15T00:00:00.000Z',
};

/** Demo password (not stored in the user object) */
export const DEMO_PASSWORD = 'codearena';
