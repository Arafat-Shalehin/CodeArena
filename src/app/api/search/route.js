import dbConnect from '@/lib/mongodb'
import { getAllProblems } from '@/services/problem.service'
import { searchUsers } from '@/services/user.service'
import { asyncHandler } from '@/lib/asyncHandler'

export const dynamic = 'force-dynamic'

/**
 * @api {get} /api/search Unified search for problems and users
 * @apiGroup Search
 * @apiParam {String} q Search query
 * @apiParam {Number} [limit=6] Results limit per category
 */
export const GET = asyncHandler(async (req) => {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit'), 10) || 6

    if (!query.trim()) {
        return Response.json({
            success: true,
            data: { problems: [], users: [] },
        })
    }

    // Run both searches in parallel for better performance
    const [problemResult, users] = await Promise.all([
        getAllProblems({ search: query, limit }),
        searchUsers(query, limit),
    ])

    return Response.json({
        success: true,
        data: {
            problems: problemResult.problems || [],
            users: users || [],
        },
    })
})
