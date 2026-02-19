import dbConnect from "@/lib/mongodb";
import { fetchSubmissionById } from "@/controllers/submission.controller";
import { asyncHandler } from "@/lib/asyncHandler";
import { protect } from "@/middlewares/auth.middleware";

export const GET = asyncHandler(async (req, context) => {
    await dbConnect();

    const user = await protect(req);

    return fetchSubmissionById(req, context, user);
});
