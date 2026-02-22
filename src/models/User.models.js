import mongoose from "mongoose";
<<<<<<< HEAD
=======
import bcrypt from "bcryptjs";
>>>>>>> 3ca122bced0c654f248973082e8b672717df5c96

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
<<<<<<< HEAD
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
=======
      required: [true, "Email is required for creating a user."],
      unique: [true, "Email already exists."],
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: [true, "Name is required for creating a account"],
      unique: [true, "Name already exists."],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [6, "Password should be contain more than 6 character."],
      select: false,
>>>>>>> 3ca122bced0c654f248973082e8b672717df5c96
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

<<<<<<< HEAD
export const User = mongoose.model("User", userSchema);
=======
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;

  return;
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.models.User || mongoose.model("User", userSchema);
>>>>>>> 3ca122bced0c654f248973082e8b672717df5c96
