import mongoose from 'mongoose'

const reactionSchema = new mongoose.Schema(
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
        type: {
            type: String,
            required: true,
            enum: ['LIKE', 'LOVE', 'CLAP', 'THINKING', 'ROCKET', 'WOW'],
        },
    },
    {
        timestamps: true,
    }
)

// Index for fast lookups and ensuring one reaction per user per problem
reactionSchema.index({ userId: 1, problemId: 1 }, { unique: true })

export const Reaction = mongoose.models.Reaction || mongoose.model('Reaction', reactionSchema)
