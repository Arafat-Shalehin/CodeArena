import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Problem } from '@/models/Problem.models'
import { protect } from '@/middlewares/auth.middleware'

export async function POST(req, { params }) {
    try {
        const { id } = await params

        // 1. Authenticate and check Admin role
        let user
        try {
            user = await protect(req)
        } catch (err) {
            return NextResponse.json(
                { error: 'UNAUTHORIZED', message: err.message },
                { status: 401 }
            )
        }

        if (user.role !== 'admin') {
            return NextResponse.json(
                { error: 'FORBIDDEN', message: 'Admin access required' },
                { status: 403 }
            )
        }

        await dbConnect()

        // 2. Fetch problem
        const problem = await Problem.findById(id)
        if (!problem) {
            return NextResponse.json(
                { error: 'NOT_FOUND', message: 'Problem not found' },
                { status: 404 }
            )
        }

        // 3. Toggle flagged status
        problem.isFlagged = !problem.isFlagged
        await problem.save()

        return NextResponse.json({
            success: true,
            message: `Problem ${problem.isFlagged ? 'flagged' : 'unflagged'} successfully`,
            isFlagged: problem.isFlagged,
        })
    } catch (error) {
        console.error('[Admin Flag API] Error:', error)
        return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 })
    }
}
