import dbConnect from "@/lib/mongodb";
import { fetchProblems, create } from "@/controllers/problem.controller";
import { asyncHandler } from "@/lib/asyncHandler";
import { authorize } from "@/middlewares/role.middleware";
import { protect } from "@/middlewares/auth.middleware";

export const GET = asyncHandler(async (req) => {
    await dbConnect();
    return fetchProblems(req);
});

export const POST = asyncHandler(async (req) => {
    await dbConnect();
    const user = await protect(req);
    req.user = user;

    await authorize(["admin"])(req);
    return create(req);
});
