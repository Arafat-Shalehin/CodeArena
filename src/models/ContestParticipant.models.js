import mongoose from 'mongoose'

const participantSchema = new mongoose.Schema(
    {
        contestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contest',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        score: {
            type: Number,
            default: 0,
        },
        rank: { type: Number },
        submissions: { type: Number, default: 0 },
        penalty: { type: Number, default: 0 },
        lastSubmissionAt: { type: Date },
        isFinished: {
            type: Boolean,
            default: false,
        },
        finishedAt: {
            type: Date,
        },
        solvedProblemIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Problem',
            },
        ],
        solvedProblemCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
)

participantSchema.index({ contestId: 1, userId: 1 }, { unique: true })
participantSchema.index({ contestId: 1, score: -1, penalty: 1 })
participantSchema.index({ contestId: 1, userId: 1, isFinished: 1 })

export const ContestParticipant =
    mongoose.models.ContestParticipant || mongoose.model('ContestParticipant', participantSchema)
