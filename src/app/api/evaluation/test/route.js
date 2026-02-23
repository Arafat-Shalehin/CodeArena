import { NextResponse } from 'next/server';
import { runSingleTest } from '@/lib/evaluation/testRunner';

/**
 * POST /api/evaluation/test
 * Test code against a single test case
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            code,
            language,
            testCase,
            timeLimit,
            memoryLimit,
            comparisonMode = 'token',
        } = body;

        // Validate required fields
        if (!code || !language || !testCase) {
            return NextResponse.json(
                { error: 'Code, language, and testCase are required' },
                { status: 400 }
            );
        }

        // Validate test case structure
        if (!testCase.input || !testCase.output) {
            return NextResponse.json(
                { error: 'Test case must have input and output fields' },
                { status: 400 }
            );
        }

        // Run test
        const result = await runSingleTest({
            code,
            language,
            testCase,
            timeLimit,
            memoryLimit,
            comparisonMode,
        });

        return NextResponse.json({
            success: true,
            result,
        });

    } catch (error) {
        console.error('Test execution error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Test execution failed',
                message: error.message
            },
            { status: 500 }
        );
    }
}
