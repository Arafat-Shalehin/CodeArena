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
        ts: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: false, // Using custom 'ts' instead
        versionKey: false,
    }
)

// Compound index for querying snapshots by session in chronological order
interviewSnapshotSchema.index({ sessionId: 1, ts: 1 })

// TTL index to automatically delete snapshots after 90 days
interviewSnapshotSchema.index({ ts: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })

export const InterviewSnapshot =
    mongoose.models.InterviewSnapshot ||
    mongoose.model('InterviewSnapshot', interviewSnapshotSchema)
