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

        const feedback = await analyzeSubmissionCode({
            code,
            language,
            problemTitle: problemTitle || 'Code Challenge',
            verdict: verdict || 'UNKNOWN',
            executionTime,
            memoryUsed,
        })

        if (!feedback) {
            return NextResponse.json(
                { success: false, error: 'AI analysis failed. Check GROQ_API_KEY.' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            feedback,
        })
    } catch (error) {
        console.error('AI analyze error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'AI analysis failed' },
            { status: 500 }
        )
    }
}
