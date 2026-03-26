import mongoose from 'mongoose'

/**
 * UserAggregateStats Schema
 *
 * Stores pre-computed aggregate statistics for each user.
 * This transforms O(N) aggregation queries into O(1) lookups.
 */
const userAggregateStatsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // Ensured one aggregate doc per user
        },
        totalSessions: {
            type: Number,
            default: 0,
        },
        weaknessFrequency: {
            type: Map,
            of: Number,
            default: {},
        },
        processedSessions: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'InterviewSession',
            default: [],
            // Note: This array will grow. For very high-volume users,
            // a different cleanup or separate tracking strategy may be needed.
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
)

// Model export
export const UserAggregateStats =
    mongoose.models.UserAggregateStats ||
    mongoose.model('UserAggregateStats', userAggregateStatsSchema)
