import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema(
    {
        contestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contest",
            required: true,
            index: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        score: {
            type: Number,
            required: true,
            default: 0,
        },

        rank: {
            type: Number,
            required: true,
        },

        // Number of submissions made in this contest
        submissions: {
            type: Number,
            default: 0,
        },

        // Used for tie-breaking (earlier submission wins)
        lastSubmissionAt: {
            type: Date,
        },

        // Optional penalty
        penalty: {
            type: Number,
            default: 0,
        },

        // Whether leaderboard has been finalized (immutable after true)
        finalized: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
);

/**
 * Prevent duplicate leaderboard entries
 * Only one leaderboard row per user per contest
 */
leaderboardSchema.index(
    { contestId: 1, userId: 1 },
    { unique: true }
);

/**
 * Optimized leaderboard pagination:
 * Fast lookup by contest + rank
 */
leaderboardSchema.index({ contestId: 1, rank: 1 });

/**
 * Sorting optimization for score-based queries
 */
leaderboardSchema.index({ contestId: 1, score: -1 });

export const Leaderboard =
    mongoose.models.Leaderboard ||
    mongoose.model("Leaderboard", leaderboardSchema);
