/**
 * scripts/seedStatsHistory.js
 *
 * Tool to seed historical stats data to verify trends and sparklines.
 */
import mongoose from 'mongoose'
import { StatsHistory } from '../src/models/StatsHistory.models.js'

async function seedHistory() {
    console.log('[Seed] Seeding historical platform stats...')

    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
        console.error('Error: MONGODB_URI not found in environment.')
        process.exit(1)
    }

    try {
        await mongoose.connect(MONGODB_URI)

        // Clear existing history
        await StatsHistory.deleteMany({})

        const now = new Date()
        const historyData = []

        // Create 7 days of historical data with varying trends
        for (let i = 7; i >= 1; i--) {
            const date = new Date(now)
            date.setDate(now.getDate() - i)
            date.setHours(0, 0, 0, 0)

            historyData.push({
                date,
                totalParticipants: 1000 + (7 - i) * 50 + Math.floor(Math.random() * 20),
                submissionsCount: 5000 + (7 - i) * 200 + Math.floor(Math.random() * 100),
                solveRate: 65 + (7 - i) * 0.5 + (Math.random() - 0.5),
                activeContests: 5 + Math.floor(Math.random() * 3),
            })
        }

        await StatsHistory.insertMany(historyData)
        console.log('[Seed] Success: 7 days of historical data inserted.')
        process.exit(0)
    } catch (error) {
        console.error('[Seed] Error during seeding:', error)
        process.exit(1)
    }
}

seedHistory()
