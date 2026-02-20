import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: [
                "SYSTEM",
                "AUTH",
                "CONTEST",
                "SUBMISSION",
                "EXECUTION",
                "SECURITY",
                "DATABASE",
            ],
        },

        level: {
            type: String,
            required: true,
            enum: ["info", "warn", "error"],
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        meta: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        contestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contest",
        },

        submissionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Submission",
        },

        ipAddress: {
            type: String,
        },

        requestId: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * INDEX STRATEGY
 */

// Filter by domain type
logSchema.index({ type: 1 });

// Filter by severity
logSchema.index({ level: 1 });

// Time-based queries (most common query pattern)
logSchema.index({ createdAt: -1 });

// Dashboard query optimization
logSchema.index({ type: 1, createdAt: -1 });

// Optional TTL (enable if you want auto-cleanup)
// logSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export const Log =
    mongoose.models.Log || mongoose.model("Log", logSchema);