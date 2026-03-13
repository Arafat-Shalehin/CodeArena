/**
 * scripts/createStatsSnapshot.js
 *
 * Background task to capture a daily snapshot of platform metrics.
 * Run this nightly or once per day to drive the Leaderboard Sparklines.
 */

import mongoose from 'mongoose'
import { User } from '../src/models/User.models.js'
import { Submission } from '../src/models/Submission.models.js'
import { Contest } from '../src/models/Contest.models.js'
import { StatsHistory } from '../src/models/StatsHistory.models.js'

async function createStatsSnapshot() {
    console.log('[Snapshot] Starting platform stats capture...')

    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
        console.error('Error: MONGODB_URI not found in environment.')
        process.exit(1)
    }

    try {
        await mongoose.connect(MONGODB_URI)

        // 1. Calculate Current Metrics
        // Total Participants (Users with at least one submission)
        const totalParticipants = await User.countDocuments({
            'stats.totalSubmissions': { $gt: 0 },
        })

        // Submissions Today (Last 24 hours)
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const submissionsToday = await Submission.countDocuments({
            createdAt: { $gte: last24h },
        })

        // Active Contests
        const activeContests = await Contest.countDocuments({
            status: 'active',
            isDeleted: false,
        })

        // Avg. Solve Rate
        const aggregateStats = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalAccepted: { $sum: '$stats.accepted' },
                    totalSubmissions: { $sum: '$stats.totalSubmissions' },
                },
            },
        ])

        const { totalAccepted = 0, totalSubmissions = 0 } = aggregateStats[0] || {}
        const solveRate =
            totalSubmissions > 0
                ? parseFloat(((totalAccepted / totalSubmissions) * 100).toFixed(1))
                : 0

        // 2. Prevent Duplicate Snapshots for Today
        const todayStr = new Date().setHours(0, 0, 0, 0)
        const existing = await StatsHistory.findOne({ date: todayStr })

        if (existing) {
            console.log(
                `[Snapshot] Update: Snapshot already exists for ${new Date(todayStr).toDateString()}. Updating values...`
            )
            await StatsHistory.findByIdAndUpdate(existing._id, {
                totalParticipants,
                submissionsCount: submissionsToday,
                solveRate,
                activeContests,
            })
        } else {
            console.log(
                `[Snapshot] Create: Saving new snapshot for ${new Date(todayStr).toDateString()}`
            )
            await StatsHistory.create({
                date: todayStr,
                totalParticipants,
                submissionsCount: submissionsToday,
                solveRate,
                activeContests,
            })
        }

        console.log('[Snapshot] Success: Platform metrics captured.')
        process.exit(0)
    } catch (error) {
        console.error('[Snapshot] Error during metric capture:', error)
        process.exit(1)
    }
}

createStatsSnapshot()
