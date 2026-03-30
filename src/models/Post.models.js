import mongoose from 'mongoose'

const postSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        comments: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                text: String,
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        type: {
            type: String,
            default: 'post',
        },
    },
    {
        timestamps: true,
    }
)

postSchema.index({ userId: 1, createdAt: -1 })

export const Post = mongoose.models.Post || mongoose.model('Post', postSchema)
