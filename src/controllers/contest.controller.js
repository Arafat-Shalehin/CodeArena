import {
    createContest,
    getAllContests,
    getContestById,
    updateContest,
    deleteContest
} from "@/services/contest.service";

/**
 * Helper to parse query params safely
 */
function parseQueryParam(value, defaultValue) {
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * POST /api/contests
 */
export async function create(req) {
    try {
        const body = await req.json();
        const contest = await createContest(body);
        return Response.json({ success: true, data: contest }, { status: 201 });
    } catch (error) {
        return Response.json({ success: false, message: error.message }, { status: 400 });
    }
}

/**
 * GET /api/contests
 */
export async function fetchContests(req) {
    try {
        const { searchParams } = new URL(req.url);
        const query = {
            page: parseQueryParam(searchParams.get("page"), 1),
            limit: parseQueryParam(searchParams.get("limit"), 10),
            status: searchParams.get("status") || undefined,
        };

        const result = await getAllContests(query);

        return Response.json({
            success: true,
            data: result.contests,
            pagination: result.pagination
        });
    } catch (error) {
        return Response.json({ success: false, message: error.message }, { status: 400 });
    }
}

/**
 * GET /api/contests/[id]
 * Optionally accepts ?isAdmin=true to populate problems regardless of status
 */
export async function fetchContestById(req, { params }) {
    try {
        const { searchParams } = new URL(req.url);
        const isAdmin = searchParams.get("isAdmin") === "true";

        const contest = await getContestById(params.id, {
            problemLimit: 50,
            isAdmin
        });

        return Response.json({ success: true, data: contest });
    } catch (error) {
        return Response.json({ success: false, message: error.message }, { status: 404 });
    }
}

/**
 * PUT /api/contests/[id]
 */
export async function update(req, { params }) {
    try {
        const body = await req.json();
        const contest = await updateContest(params.id, body);
        return Response.json({ success: true, data: contest });
    } catch (error) {
        const status = error.message.includes("not found") ? 404 : 400;
        return Response.json({ success: false, message: error.message }, { status });
    }
}

/**
 * DELETE /api/contests/[id]
 * Performs a soft delete
 */
export async function remove(req, { params }) {
    try {
        await deleteContest(params.id);
        return Response.json({ success: true, message: "Contest deleted." });
    } catch (error) {
        const status = error.message.includes("not found") ? 404 : 400;
        return Response.json({ success: false, message: error.message }, { status });
    }
}
