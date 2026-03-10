import mongoose from 'mongoose'

/**
 * StatsHistory Model
 *
 * Stores daily snapshots of platform-wide statistics for trend analysis
 * and sparkline visualizations.
 */
const statsHistorySchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
            unique: true,
            index: true,
            default: () => new Date().setHours(0, 0, 0, 0), // Default to start of current day
        },
        totalParticipants: {
            type: Number,
            default: 0,
        },
        submissionsCount: {
            type: Number,
            default: 0,
        },
        solveRate: {
            type: Number,
            default: 0,
        },
        activeContests: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
)

export const StatsHistory =
    mongoose.models.StatsHistory || mongoose.model('StatsHistory', statsHistorySchema)
