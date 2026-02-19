import dbConnect from "@/lib/mongodb";
import { asyncHandler } from "@/lib/asyncHandler";
import { createLogEntry, fetchLogs } from "@/controllers/log.controller";

export const GET = asyncHandler(async (req) => {
    await dbConnect();
    return fetchLogs(req);
});

export const POST = asyncHandler(async (req) => {
    await dbConnect();
    return createLogEntry(req);
});
