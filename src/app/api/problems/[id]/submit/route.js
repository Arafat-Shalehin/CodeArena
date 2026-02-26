import dbConnect from '@/lib/mongodb'
import { Problem } from '@/models/Problem.models'
import { executeCode } from '@/lib/docker/executor'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

/**
 * POST /api/problems/[id]/submit
 * Evaluates code against ALL test cases for a specific problem.
 */
export async function POST(request, context) {
    const params = await context.params
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ success: false, error: 'Invalid problem ID' }, { status: 400 })
    }

    try {
        await dbConnect()

        const body = await request.json()
        const { code, language } = body

        if (!code || !language) {
            return NextResponse.json(
                { success: false, error: 'Code and language are required' },
                { status: 400 }
            )
        }

        // 1. Fetch the problem with test cases
        const problem = await Problem.findById(id)
        if (!problem) {
            return NextResponse.json({ success: false, error: 'Problem not found' }, { status: 404 })
        }

        if (!problem.testCases || problem.testCases.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No test cases found for this problem' },
                { status: 400 }
            )
        }

        let overallVerdict = 'ACCEPTED'
        let maxTime = 0
        let maxMemory = 0
        let passedCount = 0
        const totalCount = problem.testCases.length
        const results = []

        // 2. Iterate through test cases
        for (let i = 0; i < totalCount; i++) {
            const testCase = problem.testCases[i]

            const result = await executeCode({
                code,
                language,
                input: testCase.input,
                timeLimit: problem.timeLimit,
                memoryLimit: problem.memoryLimit,
            })

            const testResult = {
                testCaseIndex: i,
                success: result.success,
                verdict: result.verdict,
                time: result.executionTime || 0,
                memory: result.memoryUsed || 0,
            }

            // Update max stats
            maxTime = Math.max(maxTime, testResult.time)
            maxMemory = Math.max(maxMemory, testResult.memory)

            // Validate output if the execution was successful
            if (result.success && result.verdict === 'SUCCESS') {
                const normalizedExpected = testCase.output.trim().replace(/\r\n/g, '\n')
                const normalizedActual = (result.output || '').trim().replace(/\r\n/g, '\n')

                if (normalizedExpected === normalizedActual) {
                    testResult.verdict = 'ACCEPTED'
                    passedCount++
                } else {
                    testResult.verdict = 'WRONG_ANSWER'
                    overallVerdict = 'WRONG_ANSWER'
                }
            } else {
                // Execution failed (TLE, RE, MLE, etc.)
                overallVerdict = result.verdict
            }

            results.push(testResult)

            // Stop on first failure (typical OJ behavior)
            if (overallVerdict !== 'ACCEPTED') {
                break
            }
        }

        // 3. Update problem counters
        // Increment totalSubmissions every time
        // Increment acceptedSubmissions only if all test cases passed
        const updateData = {
            $inc: { totalSubmissions: 1 },
        }

        if (overallVerdict === 'ACCEPTED') {
            updateData.$inc.acceptedSubmissions = 1
        }

        await Problem.findByIdAndUpdate(id, updateData)

        return NextResponse.json({
            success: true,
            data: {
                verdict: overallVerdict,
                passedCount,
                totalCount,
                maxTime,
                maxMemory,
                results,
            },
        })
    } catch (error) {
        console.error('[SubmissionAPI] Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Submission failed',
                message: error.message,
            },
            { status: 500 }
        )
    }
}
