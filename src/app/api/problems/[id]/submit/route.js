import mongoose from 'mongoose'
import dbConnect from '@/lib/mongodb'
import { NextResponse } from 'next/server'
import { Submission } from '@/models/Submission.models'
import { User } from '@/models/User.models'
import { protect } from '@/middlewares/auth.middleware'
import { Problem } from '@/models/Problem.models'
import { executeCode } from '@/lib/docker/executor'

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

        // Authenticate user
        let user
        try {
            user = await protect(request)
        } catch (err) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            )
        }

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
            return NextResponse.json(
                { success: false, error: 'Problem not found' },
                { status: 404 }
            )
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
                memoryLimit: problem.memoryLimit * 1024, // problem.memoryLimit is in MB, executor expects KB
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

        // 4. Create Submission record
        const submission = await Submission.create({
            userId: user._id,
            problemId: id,
            code,
            language,
            status: 'completed',
            verdict: overallVerdict.toLowerCase(), // Model uses lowercase: 'accepted', 'wrong_answer', etc.
            executionTime: maxTime,
            memoryUsed: Math.ceil(maxMemory / 1024), // Model uses MB, maxMemory is in KB
        })

        // 5. Update User Stats
        const userUpdate = {
            $inc: { 'stats.totalSubmissions': 1 },
        }

        if (overallVerdict === 'ACCEPTED') {
            userUpdate.$inc['stats.accepted'] = 1

            // Point Reward: Only for the FIRST time solving this problem
            // We check if any previous accepted submissions exist (excluding the one we just created)
            const previousAccepted = await Submission.findOne({
                userId: user._id,
                problemId: id,
                verdict: 'accepted',
                _id: { $ne: submission._id },
            })

            if (!previousAccepted) {
                const pointsMap = { easy: 10, medium: 20, hard: 50 }
                const points = pointsMap[problem.difficulty?.toLowerCase()] || 20
                userUpdate.$inc['stats.score'] = points
            }
        }
        await User.findByIdAndUpdate(user._id, userUpdate)

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
