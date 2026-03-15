import mongoose from 'mongoose'

const interviewSnapshotSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InterviewSession',
            required: true,
        },
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Problem',
            required: true,
        },
        language: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        snapshotType: {
            type: String,
            enum: ['auto', 'run', 'submit'],
            required: true,
        },
        verdict: {
            type: String, // e.g., 'Accepted', 'Wrong Answer'
        },
        passedCount: {
            type: Number,
        },
        totalCount: {
            type: Number,
        },
        ts: {
            type: Date,
            default: Date.now,
        },
        expiresAt: {
            type: Date,
        },
    },
    {
        timestamps: false, // Using custom 'ts' instead
        versionKey: false,
    }
)

// Compound index for querying snapshots by session in chronological order
interviewSnapshotSchema.index({ sessionId: 1, ts: 1 })

// Granular TTL Index: Automatic cleanup based on 'expiresAt'
interviewSnapshotSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Pre-save hook to set granular expiry
interviewSnapshotSchema.pre('save', function (next) {
    if (!this.expiresAt) {
        const now = this.ts || new Date()
        // 'auto' snapshots (intermediate keystrokes) live for 14 days
        // 'run' or 'submit' snapshots live for 90 days
        const days = this.snapshotType === 'auto' ? 14 : 90
        this.expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    }
    next()
})

export const InterviewSnapshot =
    mongoose.models.InterviewSnapshot ||
    mongoose.model('InterviewSnapshot', interviewSnapshotSchema)
