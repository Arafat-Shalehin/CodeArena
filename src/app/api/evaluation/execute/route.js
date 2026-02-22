import { NextResponse } from 'next/server';
import { executeCode } from '@/lib/docker/executor';
import { protect } from '@/middlewares/auth.middleware';

/**
 * POST /api/evaluation/execute
 * Execute code with given input
 */
export async function POST(request) {
    try {
        // Authenticate user
        await protect(request);

        const body = await request.json();
        const { code, language, input, timeLimit, memoryLimit } = body;

        // Validate required fields
        if (!code || !language) {
            return NextResponse.json(
                { error: 'Code and language are required' },
                { status: 400 }
            );
        }

        // Execute code
        const result = await executeCode({
            code,
            language,
            input: input || '',
            timeLimit,
            memoryLimit,
        });

        return NextResponse.json({
            success: true,
            result,
        });

    } catch (error) {
        console.error('Code execution error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to execute code',
                message: error.message
            },
            { status: 500 }
        );
    }
}
