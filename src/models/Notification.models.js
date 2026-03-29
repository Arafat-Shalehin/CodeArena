import mongoose from 'mongoose'

const NotificationSchema = new mongoose.Schema(
    {
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // System notifications might not have a senderId
        },
        type: {
            type: String,
            enum: ['social', 'contest', 'judging', 'ai_insight'],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        link: {
            type: String,
            required: false, // URL to redirect when clicked
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
)

export const Notification =
    mongoose.models.Notification || mongoose.model('Notification', NotificationSchema)
