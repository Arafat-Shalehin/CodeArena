import dbConnect from "@/lib/mongodb";
import { createUser, fetchUsers } from "@/controllers/user.controller";
import { asyncHandler } from "@/lib/asyncHandler";
import { authorize } from "@/middlewares/role.middleware";
import { protect } from "@/middlewares/auth.middleware";

export const dynamic = 'force-dynamic';

export const POST = asyncHandler(async (req) => {
  await dbConnect();
  return createUser(req);
});

export const GET = asyncHandler(async (req) => {
  await dbConnect();

  const user = await protect(req);
  req.user = user;

  await authorize(["admin"])(req);
  return fetchUsers();
});
