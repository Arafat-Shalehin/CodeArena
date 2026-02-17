import dbConnect from "@/lib/mongodb";
import { createUser, fetchUsers } from "@/controllers/user.controller";
import { asyncHandler } from "@/lib/asyncHandler";

export const dynamic = 'force-dynamic';

export const POST = asyncHandler(async (req) => {
  await dbConnect();
  return createUser(req);
});

export const GET = asyncHandler(async (req) => {
  await dbConnect();
  return fetchUsers();
})
