import dbConnect from "@/lib/mongodb";
import { fetchContestById, update, remove } from "@/controllers/contest.controller";
import { asyncHandler } from "@/lib/asyncHandler";
import { authorize } from "@/middlewares/role.middleware";

export const GET = asyncHandler(async (req, context) => {
    await dbConnect();

    // Detect admin for full problem population
    const isAdmin = context?.user?.role === "admin";

    return fetchContestById(req, { ...context, isAdmin });
});

export const PUT = asyncHandler(async (req, context) => {
    await dbConnect();

    // Only admin can update
    await authorize(["admin"])(req, context);

    return update(req, context);
});

export const DELETE = asyncHandler(async (req, context) => {
    await dbConnect();

    // Only admin can delete (soft delete)
    await authorize(["admin"])(req, context);

    return remove(req, context);
});
