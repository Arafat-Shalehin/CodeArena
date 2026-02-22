import dbConnect from "@/lib/mongodb";
import { fetchUserById, removeUser } from "@/controllers/user.controller";
import { asyncHandler } from "@/lib/asyncHandler";

export const GET = asyncHandler(async (req, { params }) => {
  await dbConnect();
  return fetchUserById();
});

export const DELETE = asyncHandler(async (req, { params }) => {
  await dbConnect();
  return removeUser();
});
