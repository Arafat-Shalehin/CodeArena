import mongoose from 'mongoose'

const interviewMessageSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InterviewSession',
            required: true,
            index: true,
        },
        id: {
            type: String,
            unique: true,
            sparse: true,
            index: true,
        },
        role: {
            type: String,
            enum: ['ai', 'user', 'system'],
            required: true,
        },
        phase: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        tokens: {
            type: Number,
            default: 0,
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

// Compound index for efficient querying of messages by session in chronological order
interviewMessageSchema.index({ sessionId: 1, ts: 1 })

export const InterviewMessage =
    mongoose.models.InterviewMessage || mongoose.model('InterviewMessage', interviewMessageSchema)
