import dbConnect from "@/lib/mongodb";
import { asyncHandler } from "@/lib/asyncHandler";
import { cleanupLogs } from "@/controllers/log.controller";

export const DELETE = asyncHandler(async (req) => {
    await dbConnect();
    return cleanupLogs(req);
});
