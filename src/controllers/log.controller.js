import { createLog, getLogs, getLogById, deleteLog } from '@/services/log.service'

/**
 * GET /api/admin/logs
 * Query logs with filters & pagination
 */
export async function fetchLogs(req) {
    const { searchParams } = new URL(req.url)

    const query = {
        page: searchParams.get('page'),
        limit: searchParams.get('limit'),
        type: searchParams.get('type'),
        level: searchParams.get('level'),
        userId: searchParams.get('userId'),
        contestId: searchParams.get('contestId'),
        submissionId: searchParams.get('submissionId'),
        from: searchParams.get('from'),
        to: searchParams.get('to'),
    }

    const result = await getLogs(query)

    return Response.json({
        success: true,
        data: result.logs,
        pagination: result.pagination,
    })
}

/**
 * GET /api/admin/logs/[id]
 * Get single log
 */
export async function fetchLogById(req, { params }) {
    const log = await getLogById(params.id)

    return Response.json({
        success: true,
        data: log,
    })
}

/**
 * DELETE /api/admin/logs/[id]
 * Delete log entry
 */
export async function removeLog(req, { params }) {
    await deleteLog(params.id)

    return Response.json({
        success: true,
        message: 'Log deleted successfully.',
    })
}

/**
 * OPTIONAL (Internal use)
 * POST /api/admin/logs
 * Manually create log (rarely used, mostly for testing)
 */
export async function createManualLog(req) {
    const body = await req.json()

    const log = await createLog(body)

    return Response.json(
        {
            success: true,
            data: log,
        },
        { status: 201 }
    )
}
