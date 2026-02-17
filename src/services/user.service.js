import { User } from "@/models/User.models";
import { signToken } from "@/lib/jwt";

export async function registerUser(data) {
  try {
    const user = await User.create(data);

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error("Email already exists.");
      err.status = 400;
      throw err;
    }
    throw error;
  }
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
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new Error("User not found.");
  }
  return user;
}
