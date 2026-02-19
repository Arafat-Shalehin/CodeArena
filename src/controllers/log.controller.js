import {
    createLog,
    getLogs,
    deleteOldLogs,
    LOG_TYPES,
} from "@/services/log.service";

/**
 * POST /api/logs
 * Create a log entry manually (rarely used externally)
 */
export const createLogEntry = async (req) => {
    const body = await req.json();
    const { type, message, meta } = body;

    const log = await createLog({ type, message, meta });

    return Response.json(
        {
            success: true,
            data: log,
        },
        { status: 201 }
    );
};

/**
 * GET /api/logs
 * Query params:
 * ?type=error
 * ?page=1
 * ?limit=20
 * ?from=2026-01-01
 * ?to=2026-01-31
 */
export const fetchLogs = async (req) => {
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const result = await getLogs({
        type,
        page,
        limit,
        from,
        to,
    });

    return Response.json(
        {
            success: true,
            ...result,
        },
        { status: 200 }
    );
};

/**
 * DELETE /api/logs/cleanup
 * ?days=30
 */
export const cleanupLogs = async (req) => {
    const { searchParams } = new URL(req.url);
    const days = Number(searchParams.get("days")) || 30;

    const deletedCount = await deleteOldLogs(days);

    return Response.json(
        {
            success: true,
            message: `${deletedCount} logs deleted`,
        },
        { status: 200 }
    );
};
