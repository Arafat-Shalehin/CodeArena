import { User } from "@/models/User.models";
import { signToken } from "@/lib/jwt";

export async function registerUser(data) {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw new Error("User already exists with this email.");
  }

  const user = await User.create(data);

  return {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function loginUser(email, password) {
  const user = await User.findOne({ email }).select("+password");

  if (!user) throw new Error("Invalid credentials.");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error("Invalid credentials.");

  const token = signToken({
    id: user._id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export async function getAllUsers() {
  return User.find().select("-password");
}

export async function getUserById(id) {
  const user = await User.findById(id).select("-password");
  if (!user) {
    throw new Error("User not found.");
  }
  return user;
}

export async function deleteUser(id) {
  return User.findByIdAndDelete(id);
}
