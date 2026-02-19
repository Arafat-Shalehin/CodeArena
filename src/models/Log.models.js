import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: [
                "error",
                "info",
                "warning",
                "auth",
                "submission",
                "contest",
                "system",
            ],
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        meta: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

/**
 * Indexes for performance
 */
logSchema.index({ type: 1 });
logSchema.index({ createdAt: -1 });

export const Log =
    mongoose.models.Log || mongoose.model("Log", logSchema);
