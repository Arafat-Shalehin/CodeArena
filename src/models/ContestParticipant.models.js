import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contest",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  rank: { type: Number },
<<<<<<< HEAD
});

participantSchema.index({ contestId: 1, score: -1 });

export const ContestParticipant = mongoose.model(
  "ContestParticipant",
  participantSchema,
);
=======
}, { timestamps: true });

participantSchema.index({ contestId: 1, userId: 1 }, { unique: true });
participantSchema.index({ contestId: 1, score: -1 });

export const ContestParticipant =
  mongoose.models.ContestParticipant ||
  mongoose.model("ContestParticipant", participantSchema);
>>>>>>> 3ca122bced0c654f248973082e8b672717df5c96
