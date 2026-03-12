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
            enum: ['practice', 'timed', 'company_sim'],
            required: true,
            default: 'practice',
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
            enum: ['greeting', 'coding', 'submitted', 'followup', 'ended'],
            default: 'greeting',
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

export const InterviewSession =
    mongoose.models.InterviewSession || mongoose.model('InterviewSession', interviewSessionSchema)
