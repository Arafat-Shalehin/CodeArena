import mongoose from 'mongoose'

const interviewSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        problemIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Problem',
            },
        ],
        mode: {
            type: String,
            enum: ['practice', 'timed', 'company_sim', 'coding', 'mock'],
            required: true,
            default: 'coding',
        },
        durationMins: {
            type: Number,
            required: true,
            default: 60,
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'expired', 'terminated'],
            default: 'active',
            index: true,
        },
        currentPhase: {
            type: String,
            enum: ['intro', 'qa', 'coding', 'evaluation', 'completed'],
            default: 'intro',
        },
        startedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        endedAt: {
            type: Date,
            default: null,
        },
        hintsUsed: {
            type: Number,
            default: 0,
        },
        submissionIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Submission',
            },
        ],
        finalScore: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
)

// In Next.js with HMR, the model might already be registered with an old schema.
// We delete it from the cache to ensure the new enum values are recognized.
if (mongoose.models && mongoose.models.InterviewSession) {
    delete mongoose.models.InterviewSession
}

export const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema)
