import mongoose from "mongoose";
import {
    createSubmission,
    getAllSubmissions,
    getSubmissionById,
} from "@/services/submission.service";

/**
 * POST /api/submissions
 */
export async function submitCode(req) {
    try {
        const body = await req.json();
        const userId = req.user.id;

        // Whitelist allowed fields
        const { problemId, code, language, contestId } = body;

        if (!problemId || !code || !language) {
            return Response.json(
                { success: false, message: "Missing required fields." },
                { status: 400 }
            );
        }

        if (code.length > 100000) {
            return Response.json(
                { success: false, message: "Code size exceeds limit." },
                { status: 400 }
            );
        }

        const submission = await createSubmission({
            userId,
            problemId,
            code,
            language,
            contestId,
        });

        return Response.json(
            { success: true, data: submission },
            { status: 201 }
        );
    } catch (error) {
        return Response.json(
            { success: false, message: error.message || "Submission failed." },
            { status: 400 }
        );
    }
}

/**
 * GET /api/submissions
 */
export async function fetchSubmissions(req) {
    try {
        const { searchParams } = new URL(req.url);
        const user = req.user;

        const query = {
            page: searchParams.get("page"),
            limit: searchParams.get("limit"),
            problemId: searchParams.get("problemId"),
            userId: searchParams.get("userId"),
            contestId: searchParams.get("contestId"),
            verdict: searchParams.get("verdict"),
            status: searchParams.get("status"),
        };

        // Enforce tenant isolation
        if (user.role !== "admin") {
            query.userId = user.id;
        }

        const result = await getAllSubmissions(query);

        return Response.json({
            success: true,
            data: result.submissions,
            pagination: result.pagination,
        });
    } catch (error) {
        return Response.json(
            { success: false, message: "Failed to fetch submissions." },
            { status: 500 }
        );
    }
}

/**
 * GET /api/submissions/[id]
 */
export async function fetchSubmissionById(req, { params }) {
    try {
        const user = req.user;

        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return Response.json(
                { success: false, message: "Invalid submission ID." },
                { status: 400 }
            );
        }

        // Authorization handled in service
        const submission = await getSubmissionById(params.id, user);

        return Response.json({
            success: true,
            data: submission,
        });
    } catch (error) {
        return Response.json(
            { success: false, message: error.message || "Failed to fetch submission." },
            { status: 400 }
        );
    }
}
