import mongoose from 'mongoose'

const userInterviewStatsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InterviewSession',
            required: true,
            unique: true, // Idempotency Guard
        },
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Problem',
            required: true,
        },
        overallScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        strengths: {
            type: [String],
            default: [],
        },
        weaknesses: {
            type: [String],
            default: [],
        },
        recommendation: {
            type: String,
            default: 'maybe',
        },
        timeInQaPhase: {
            type: Number,
            default: null,
        },
        timeInCodingPhase: {
            type: Number,
            default: null,
        },
        completedAt: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
)

// Index for fast analytics and chronological sorting
userInterviewStatsSchema.index({ userId: 1, completedAt: -1 })

export const UserInterviewStats =
    mongoose.models.UserInterviewStats ||
    mongoose.model('UserInterviewStats', userInterviewStatsSchema)
