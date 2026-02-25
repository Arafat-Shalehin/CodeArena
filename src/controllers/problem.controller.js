import {
    getAllProblems,
    getProblemById,
    createProblem,
    updateProblem,
    deleteProblem,
} from '@/services/problem.service'

/**
 * Handle GET /api/problems
 */
export async function fetchProblems(req) {
    const { searchParams } = new URL(req.url)

    const query = {
        page: searchParams.get('page'),
        limit: searchParams.get('limit'),
        difficulty: searchParams.get('difficulty'),
        search: searchParams.get('search'),
    }

    const result = await getAllProblems(query)

    return Response.json({
        success: true,
        data: result.problems,
        pagination: result.pagination,
    })
}

/**
 * Handle GET /api/problems/[id]
 */
export async function fetchProblemById(req, { params }) {
    const { id } = params
    const problem = await getProblemById(id)

    return Response.json({
        success: true,
        data: problem,
    })
}

/**
 * Handle POST /api/problems
 */
export async function create(req) {
    const body = await req.json()
    const problem = await createProblem(body)
    return Response.json({ success: true, data: problem }, { status: 201 })
}

/**
 * Handle PUT /api/problems/[id]
 */
export async function update(req, { params }) {
    const body = await req.json()
    const problem = await updateProblem(params.id, body)
    return Response.json({ success: true, data: problem })
}

/**
 * Handle DELETE /api/problems/[id]
 */
export async function remove(req, { params }) {
    await deleteProblem(params.id)
    return Response.json({ success: true, message: 'Problem deleted' })
}
