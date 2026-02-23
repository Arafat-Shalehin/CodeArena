import dbConnect from "@/lib/mongodb";
import { asyncHandler } from "@/lib/asyncHandler";
import { protect } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import {
    fetchLeaderboard,
    deleteLeaderboard,
} from "@/controllers/leaderboard.controller";

export const GET = asyncHandler(async (req, context) => {
    await dbConnect();
    return fetchLeaderboard(req, context);
});

export const DELETE = asyncHandler(async (req, context) => {
    await dbConnect();

    const user = await protect(req);
    req.user = user;

    await authorize(["admin"])(req);

    return deleteLeaderboard(req, context);
});
