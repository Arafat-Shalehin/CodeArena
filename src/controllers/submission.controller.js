import mongoose from 'mongoose'
import {
    createSubmission,
    getAllSubmissions,
    getSubmissionById,
} from '@/services/submission.service'

/**
 * POST /api/submissions
 */
export async function submitCode(req, user) {
    try {
        const userId = user.id
        const body = await req.json()

        // Whitelist allowed fields
        const { problemId, code, language, contestId, type, customInput, cachedResult } = body

        console.log('[API] POST /api/submissions called')
        console.log('[API] User ID:', userId)
        console.log('[API] Request body keys:', Object.keys(body))
        console.log('[API] Code received?', !!code)
        console.log('[API] Cached result provided?', !!cachedResult)
        console.log('[API] Request body:', { problemId, type, codeLength: code?.length, language })

        if (!problemId || !code || !language) {
            console.error('[API] Missing required fields')
            return Response.json(
                { success: false, message: 'Missing required fields.' },
                { status: 400 }
            )
        }

        if (code.length > 100000) {
            console.error('[API] Code size exceeds limit')
            return Response.json(
                { success: false, message: 'Code size exceeds limit.' },
                { status: 400 }
            )
        }

        console.log('[API] Creating submission via service...')
        const submission = await createSubmission({
            userId,
            problemId,
            code,
            language,
            contestId,
            type,
            customInput,
            cachedResult,
        })

        console.log('[API] Submission created successfully:', submission._id)
        return Response.json({ success: true, data: submission }, { status: 201 })
    } catch (error) {
        console.error('[API] Submission error:', error.message)
        return Response.json(
            { success: false, message: error.message || 'Submission failed.' },
            { status: 400 }
        )
    }
}

/**
 * GET /api/submissions
 */
export async function fetchSubmissions(req, user) {
    try {
        const { searchParams } = new URL(req.url)

        const query = {
            page: searchParams.get('page'),
            limit: searchParams.get('limit'),
            problemId: searchParams.get('problemId'),
            userId: searchParams.get('userId'),
            contestId: searchParams.get('contestId'),
            verdict: searchParams.get('verdict'),
            status: searchParams.get('status'),
            offset: searchParams.get('offset'),
        }

        // Enforce tenant isolation for private data, but allow viewing recent history
        if (!query.userId && user.role !== 'admin') {
            query.userId = user.id
        }
        // If query.userId is provided, we allow it (for public profiles)
        // Submissions don't contain sensitive data like test case details in the list view

        const result = await getAllSubmissions(query)

        return Response.json({
            success: true,
            data: result.submissions,
            pagination: result.pagination,
        })
    } catch (error) {
        return Response.json(
            { success: false, message: 'Failed to fetch submissions.' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/submissions/[id]
 */
export async function fetchSubmissionById(req, context, user) {
    try {
        const { id } = await context.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return Response.json(
                { success: false, message: 'Invalid submission ID.' },
                { status: 400 }
            )
        }

        // Authorization handled in service
        const submission = await getSubmissionById(id)

        if (user.role !== 'admin' && submission.userId._id.toString() !== user.id) {
            return Response.json({ success: false, message: 'Access denied.' }, { status: 403 })
        }

        return Response.json({
            success: true,
            data: submission,
        })
    } catch (error) {
        return Response.json(
            { success: false, message: error.message || 'Failed to fetch submission.' },
            { status: 400 }
        )
    }
}
