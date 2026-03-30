import mongoose from 'mongoose'

const problemInteractionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Problem',
            required: true,
        },
        event: {
            type: String,
            enum: ['viewed', 'attempted', 'solved', 'flagged', 'bookmarked'],
            required: true,
        },
        duration: {
            type: Number, // seconds viewing
            default: 0,
        },
        difficulty_rating: {
            type: Number, // 1-5 user rating
            min: 1,
            max: 5,
        },
        quality_rating: {
            type: Number, // 1-5 problem quality
            min: 1,
            max: 5,
        },
        helpful: {
            type: Boolean,
        },
    },
    { timestamps: true }
)

export const ProblemInteraction =
    mongoose.models.ProblemInteraction ||
    mongoose.model('ProblemInteraction', problemInteractionSchema)
