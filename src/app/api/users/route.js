import dbConnect from "@/lib/mongodb";
import { createUser, fetchUsers } from "@/controllers/user.controller";
import { asyncHandler } from "@/lib/asyncHandler";
import { authorize } from "@/middlewares/role.middleware";

export const POST = asyncHandler(async (req) => {
  await dbConnect();
  return createUser(req);
});

export const GET = asyncHandler(async (req) => {
  await dbConnect();
  await authorize(["admin"])(req);
  return fetchUsers();
});
