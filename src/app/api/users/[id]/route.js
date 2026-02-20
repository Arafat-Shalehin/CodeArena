import dbConnect from "@/lib/mongodb";
import { fetchUserById, removeUser } from "@/controllers/user.controller";
import { asyncHandler } from "@/lib/asyncHandler";

export const GET = asyncHandler(async (req, context) => {
  await dbConnect();
  return fetchUserById(req, context);
});

export const DELETE = asyncHandler(async (req, context) => {
  await dbConnect();
  await authorize(["admin"])(req);
  return removeUser(req, context);
});
