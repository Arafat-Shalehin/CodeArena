import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    problemIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
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
      enum: ["upcoming", "active", "completed"],
      default: "upcoming",
    },
  },
  { timestamps: true },
);

contestSchema.index({ startTime: 1, endTime: 1 });

<<<<<<< HEAD
export const Contest = mongoose.model("Contest", contestSchema);
=======
export const Contest =
  mongoose.models.Contest || mongoose.model("Contest", contestSchema);
>>>>>>> 3ca122bced0c654f248973082e8b672717df5c96
