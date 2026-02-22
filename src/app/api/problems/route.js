import dbConnect from "@/lib/mongodb";
import { fetchProblems, create } from "@/controllers/problem.controller";
import { asyncHandler } from "@/lib/asyncHandler";
import { authorize } from "@/middlewares/role.middleware";

export const GET = asyncHandler(async (req) => {
    await dbConnect();
    return fetchProblems(req);
});

export const POST = asyncHandler(async (req) => {
    await authorize(["admin"])(req);
    await dbConnect();
    return create(req);
});
