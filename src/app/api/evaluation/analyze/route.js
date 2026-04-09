export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { analyzeSubmissionCode } from '@/lib/ai/groqClient'
import { protect } from '@/middlewares/auth.middleware'

/**
 * POST /api/evaluation/analyze
 * Analyze code using Groq AI — requires authentication.
 * Accepts code, language, verdict, and optional stats directly.
 */
export async function POST(request) {
    try {
        // 1. Authenticate user
        const user = await protect(request)
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { code, language, problemTitle, verdict, executionTime = 0, memoryUsed = 0 } = body

        if (!code || !language) {
            return NextResponse.json(
                { success: false, error: 'Code and language are required' },
                { status: 400 }
            )
        }

        const feedback = await analyzeSubmissionCode(
            {
                code,
                language,
                problemTitle: problemTitle || 'Code Challenge',
                verdict: verdict || 'UNKNOWN',
                executionTime,
                memoryUsed,
            },
            { throwOnError: true }
        )

        if (!feedback) {
            return NextResponse.json(
                { success: false, error: 'AI analysis failed.' },
                { status: 502 }
            )
        }

        return NextResponse.json({
            success: true,
            feedback,
        })
    } catch (error) {
        console.error('AI analyze error:', error)

        const status = Number(error?.status || 0) || 500
        const payload = {
            success: false,
            error: error.message || 'AI analysis failed',
            code: error?.code,
        }

        if (status === 429 && Number.isFinite(Number(error?.retryAfterSeconds))) {
            payload.retryAfterSeconds = Math.max(1, Math.ceil(Number(error.retryAfterSeconds)))
        }

        return NextResponse.json(payload, { status })
    }
}
