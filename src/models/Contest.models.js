import mongoose from 'mongoose'

const contestSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
        },
        problemIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Problem',
            },
        ],
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['upcoming', 'active', 'completed'],
            default: 'upcoming',
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        maxParticipants: { type: Number, default: null },
        reminderSent: { type: Boolean, default: false },
        isResultReady: { type: Boolean, default: false },
    },
    { timestamps: true }
)

contestSchema.index({ status: 1, startTime: -1 })
contestSchema.index({ startTime: 1, endTime: 1 })

// Virtual field to auto-derive status based on current time
contestSchema.virtual('derivedStatus').get(function () {
    const now = new Date()
    if (now < this.startTime) return 'upcoming'
    if (now >= this.startTime && now <= this.endTime) return 'active'
    return 'completed'
})

export const Contest = mongoose.models.Contest || mongoose.model('Contest', contestSchema)
