import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    timeLimit: { type: Number, required: true },
    memoryLimit: { type: Number, required: true },
    testCases: [
      {
        input: String,
        output: String,
      },
    ],
  },
  { timestamps: true },
);

<<<<<<< HEAD
export const Problem = mongoose.model("Problem", problemSchema);
=======
export const Problem = mongoose.models.Problem || mongoose.model("Problem", problemSchema);
>>>>>>> 3ca122bced0c654f248973082e8b672717df5c96
