import { logout } from "@/controllers/user.controller";
import { asyncHandler } from "@/lib/asyncHandler";
import dbConnect from "@/lib/mongodb";
import { protect } from "@/middlewares/auth.middleware";

/**
 * POST /api/auth/logout
 * Authenticated — clears the httpOnly auth cookie
 */
export const POST = asyncHandler(async (req) => {
    await dbConnect();
    await protect(req);
    return logout();
});
