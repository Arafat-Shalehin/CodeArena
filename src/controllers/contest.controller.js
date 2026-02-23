import {
    createContest,
    getAllContests,
    getContestById,
    updateContest,
    deleteContest,
} from '@/services/contest.service'

/**
 * Helper to parse query params safely
 */
function parseQueryParam(value, defaultValue) {
    const parsed = parseInt(value)
    return isNaN(parsed) ? defaultValue : parsed
}

/**
 * POST /api/contests
 */
export async function create(req) {
    const body = await req.json()
    const contest = await createContest(body)
    return Response.json({ success: true, data: contest }, { status: 201 })
}

/**
 * GET /api/contests
 */
export async function fetchContests(req) {
    const { searchParams } = new URL(req.url)
    const query = {
        page: parseQueryParam(searchParams.get('page'), 1),
        limit: parseQueryParam(searchParams.get('limit'), 10),
        status: searchParams.get('status') || undefined,
    }

    const result = await getAllContests(query)

    return Response.json({
        success: true,
        data: result.contests,
        pagination: result.pagination,
    })
}

/**
 * GET /api/contests/[id]
 */
export async function fetchContestById(req, { params, isAdmin }) {
    // Destructure isAdmin here

    // Await params
    const { id } = await params

    // Use the isAdmin boolean passed from the route
    const contest = await getContestById(id, {
        problemLimit: 50,
        isAdmin: !!isAdmin,
    })

    if (!contest) {
        return Response.json({ success: false, message: 'Contest not found' }, { status: 404 })
    }

    return Response.json({ success: true, data: contest })
}

/**
 * PUT /api/contests/[id]
 */
export async function update(req, { params }) {
    try {
        const body = await req.json()
        const contest = await updateContest(params.id, body)
        return Response.json({ success: true, data: contest })
    } catch (error) {
        const status = error.message.includes('not found') ? 404 : 400
        return Response.json({ success: false, message: error.message }, { status })
    }
}

/**
 * DELETE /api/contests/[id]
 * Performs a soft delete
 */
export async function remove(req, { params }) {
    await deleteContest(params.id)
    return Response.json({ success: true, message: 'Contest deleted.' })
}
