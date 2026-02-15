import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "contestant"],
      default: "user",
    },
    stats: {
      totalSubmissions: { type: Number, default: 0 },
      accepted: { type: Number, default: 0 },
      score: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
