export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import dbConnect from '@/lib/mongodb'
import { NextResponse } from 'next/server'
import { judgeSubmission, quickJudge, validateSubmission } from '@/lib/evaluation/judge'
import { protect } from '@/middlewares/auth.middleware'
import { Submission } from '@/models/Submission.models'
import { analyzeSubmissionCode } from '@/lib/ai/geminiClient'

/**
 * POST /api/evaluation/judge
 * Full evaluation with all test cases
 */
export async function POST(request) {
    try {
        await dbConnect()
        // Authenticate user
        await protect(request)

        const body = await request.json()
        const {
            code,
            language,
            problemId,
            testCases,
            timeLimit,
            memoryLimit,
            comparisonMode = 'token',
            quick = false,
        } = body

        // Validate submission
        const validation = validateSubmission({ code, language, problemId })
        if (!validation.isValid) {
            return NextResponse.json(
                {
                    success: false,
                    errors: validation.errors,
                },
                { status: 400 }
            )
        }

        // Validate test cases
        if (!testCases || testCases.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Test cases are required',
                },
                { status: 400 }
            )
        }

        // Run evaluation
        let result
        if (quick) {
            // Quick judge (public tests only)
            result = await quickJudge({
                code,
                language,
                testCases: testCases.filter((tc) => !tc.isHidden),
                timeLimit,
                memoryLimit,
                comparisonMode,
            })
        } else {
            // Full judge (all tests)
            result = await judgeSubmission({
                code,
                language,
                problemId,
                testCases,
                timeLimit,
                memoryLimit,
                comparisonMode,
            })
        }

        // --- BACKGROUND AI ANALYSIS ---
        // Fire Gemini analysis if eligible, but do not await (dont hold up the HTTP response to the user)
        if (
            !quick &&
            result &&
            (result.verdict === 'ACCEPTED' || result.verdict === 'TIME_LIMIT_EXCEEDED')
        ) {
            // Self-invoking async function to run in the background
            ;(async () => {
                try {
                    const aiFeedback = await analyzeSubmissionCode({
                        code,
                        language,
                        problemTitle: `Problem ID: \${problemId}`,
                        verdict: result.verdict,
                        executionTime: result.stats?.executionTime || 0,
                        memoryUsed: result.stats?.memoryUsed || 0,
                    })

                    if (aiFeedback) {
                        // Assuming the submission was already created elsewhere, or we create it here
                        // If tracking actual submission records, look them up. For now, find latest by User/Problem
                        // Alternatively, you would pass the actual submissionId created before running judge
                        // Since judgeSubmission just returning results, find the submission to update if one exists,
                        // or trust that the submission creation logic handles it.
                        // Ideally, we'd update the exact submission row here:
                        await Submission.findOneAndUpdate(
                            { userId: request.user._id, problemId }, // Gets the latest roughly
                            { $set: { aiFeedback: aiFeedback } },
                            { sort: { createdAt: -1 } }
                        )
                    }
                } catch (aiErr) {
                    console.error('Background AI Analysis Failed:', aiErr)
                }
            })()
        }

        return NextResponse.json({
            success: true,
            result,
        })
    } catch (error) {
        console.error('Evaluation error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Evaluation failed',
                message: error.message,
            },
            { status: 500 }
        )
    }
}
