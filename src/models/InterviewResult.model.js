import mongoose from 'mongoose'

const problemScoreSchema = new mongoose.Schema(
    {
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Problem',
            required: true,
        },
        score: {
            type: Number,
            required: true,
            default: 0,
        },
        feedback: {
            type: String,
            default: '',
        },
    },
    { _id: false }
)

const interviewResultSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InterviewSession',
            required: true,
            unique: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        problemScores: [problemScoreSchema],
        communicationScore: {
            type: Number,
            required: true,
            default: 0,
        },
        approachScore: {
            type: Number,
            required: true,
            default: 0,
        },
        codeQualityScore: {
            type: Number,
            required: true,
            default: 0,
        },
        overallScore: {
            type: Number,
            required: true,
            default: 0,
        },
        aiSummary: {
            type: String,
            required: true,
        },
        strengths: [
            {
                type: String,
            },
        ],
        areasToImprove: [
            {
                type: String,
            },
        ],
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: false, // Using custom 'createdAt' instead
        versionKey: false,
    }
)

export const InterviewResult =
    mongoose.models.InterviewResult || mongoose.model('InterviewResult', interviewResultSchema)
