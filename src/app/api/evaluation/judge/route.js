import { NextResponse } from 'next/server';
import { judgeSubmission, quickJudge, validateSubmission } from '@/lib/evaluation/judge';

/**
 * POST /api/evaluation/judge
 * Full evaluation with all test cases
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            code,
            language,
            problemId,
            testCases,
            timeLimit,
            memoryLimit,
            comparisonMode = 'token',
            quick = false,
        } = body;

        // Validate submission
        const validation = validateSubmission({ code, language, problemId });
        if (!validation.isValid) {
            return NextResponse.json(
                {
                    success: false,
                    errors: validation.errors
                },
                { status: 400 }
            );
        }

        // Validate test cases
        if (!testCases || testCases.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Test cases are required'
                },
                { status: 400 }
            );
        }

        // Run evaluation
        let result;
        if (quick) {
            // Quick judge (public tests only)
            result = await quickJudge({
                code,
                language,
                testCases: testCases.filter(tc => !tc.isHidden),
                timeLimit,
                memoryLimit,
                comparisonMode,
            });
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
            });
        }

        return NextResponse.json({
            success: true,
            result,
        });

    } catch (error) {
        console.error('Evaluation error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Evaluation failed',
                message: error.message
            },
            { status: 500 }
        );
    }
}
