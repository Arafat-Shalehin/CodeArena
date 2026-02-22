import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
    },
    code: {
      type: String,
<<<<<<< HEAD
      required: true,
    },
    language: {
      type: String,
      enum: ["javascript", "python", "cpp"],
=======
      required: [true, "Need to write some code before try to submit."],
    },
    language: {
      type: String,
      enum: ["javascript", "java", "python", "cpp"],
>>>>>>> 3ca122bced0c654f248973082e8b672717df5c96
      required: true,
    },
    status: {
      type: String,
      enum: ["queued", "running", "completed", "error"],
      default: "queued",
    },
    verdict: {
      type: String,
      enum: [
        "accepted",
        "wrong_answer",
        "time_limit_exceeded",
        "runtime_error",
        "compilation_error",
      ],
    },
    executionTime: { type: Number }, // ms
    memoryUsed: { type: Number }, // MB
  },
  { timestamps: true },
);

submissionSchema.index({ userId: 1, problemId: 1 });
submissionSchema.index({ contestId: 1 });

<<<<<<< HEAD
export const Submission = mongoose.model("Submission", submissionSchema);
=======
export const Submission = mongoose.models.Submission || mongoose.model("Submission", submissionSchema);
>>>>>>> 3ca122bced0c654f248973082e8b672717df5c96
