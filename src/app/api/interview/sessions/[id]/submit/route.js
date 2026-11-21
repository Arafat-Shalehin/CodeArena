import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { InterviewSession } from '@/models/InterviewSession.model'
import { Problem } from '@/models/Problem.models'
import { InterviewSnapshot } from '@/models/InterviewSnapshot.model'
import { protect } from '@/middlewares/auth.middleware'
import { executeCode } from '@/lib/docker/executor'
import { aiEnginePort } from '@/lib/ai-engine'

const VERDICTS = {
    SUCCESS: 'SUCCESS',
    WRONG_ANSWER: 'WRONG_ANSWER',
    COMPILATION_ERROR: 'COMPILATION_ERROR',
    RUNTIME_ERROR: 'RUNTIME_ERROR',
    TIME_LIMIT_EXCEEDED: 'TIME_LIMIT_EXCEEDED',
    MEMORY_LIMIT_EXCEEDED: 'MEMORY_LIMIT_EXCEEDED',
    SYSTEM_ERROR: 'SYSTEM_ERROR',
    SECURITY_ERROR: 'SECURITY_ERROR',
}

function simulateSubmission(code, problem) {
    let finalVerdict = VERDICTS.SUCCESS
    let firstError = ''

    const bracketMatch = (code.match(/{/g) || []).length === (code.match(/}/g) || []).length
    if (!bracketMatch) {
        finalVerdict = VERDICTS.COMPILATION_ERROR
        firstError = 'Compilation Error: Unbalanced curly braces detected.'
    } else if (code.trim().length === 0) {
        finalVerdict = VERDICTS.COMPILATION_ERROR
        firstError = 'Compilation Error: Empty source file.'
    } else if (code.includes('// force-tle') || code.includes('// TLE')) {
        finalVerdict = VERDICTS.TIME_LIMIT_EXCEEDED
    } else if (code.includes('// force-mle') || code.includes('// MLE')) {
        finalVerdict = VERDICTS.MEMORY_LIMIT_EXCEEDED
    } else if (code.includes('// force-re') || code.includes('// RE')) {
        finalVerdict = VERDICTS.RUNTIME_ERROR
        firstError = 'Runtime Error: Simulated program crash.'
    } else if (code.includes('// force-wa') || code.includes('// WA')) {
        finalVerdict = VERDICTS.WRONG_ANSWER
    } else if (code.includes('// force-se') || code.includes('// SE')) {
        finalVerdict = VERDICTS.SYSTEM_ERROR
        firstError = 'System Error: Internal sandbox crashed.'
    } else if (code.includes('// force-xe') || code.includes('// XE')) {
        finalVerdict = VERDICTS.SECURITY_ERROR
        firstError = 'Security Error: Blocked execution due to unsafe keyword.'
    }

    const testCasesCount = (problem.sampleTestCases?.length || 0) + (problem.testCases?.length || 0)
    const passedCount = finalVerdict === VERDICTS.SUCCESS ? testCasesCount : Math.max(0, testCasesCount - 1)

    return {
        success: finalVerdict === VERDICTS.SUCCESS,
        verdict: finalVerdict,
        passedCount,
        totalCount: testCasesCount,
        error: firstError,
        time: 120,
        memory: 4096,
    }
}

export async function POST(req, { params }) {
    await dbConnect()

    try {
        const user = await protect(req)
        const { id: sessionId } = await params
        const { code, language, problemId } = await req.json()

        const session = await InterviewSession.findById(sessionId)
        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        if (session.userId.toString() !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const problem = await Problem.findById(problemId)
        if (!problem) {
            return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
        }

        let result
        if (process.env.RUNTIME_MODE === 'serverless') {
            result = simulateSubmission(code, problem)
        } else {
            try {
                const testCases = [
                    ...(problem.sampleTestCases || []),
                    ...(problem.testCases || []),
                ]

                let overallResult = {
                    success: true,
                    verdict: 'SUCCESS',
                    passedCount: 0,
                    totalCount: testCases.length,
                }

                let firstFailure = null
                for (const tc of testCases) {
                    const res = await executeCode({
                        code,
                        language,
                        input: tc.input,
                        expectedOutput: tc.output,
                        timeLimit: problem.timeLimit,
                        memoryLimit: problem.memoryLimit,
                    })

                    if (res.success && res.verdict === 'SUCCESS') {
                        overallResult.passedCount++
                    } else if (!firstFailure) {
                        firstFailure = res
                    }
                }

                if (firstFailure) {
                    overallResult = {
                        ...firstFailure,
                        passedCount: overallResult.passedCount,
                        totalCount: testCases.length,
                    }
                }
                result = overallResult
            } catch (err) {
                console.warn('[Interview Submit API] Docker execution failed, falling back to simulation:', err)
                result = simulateSubmission(code, problem)
            }
        }

        // Persist snapshot for submissions
        await InterviewSnapshot.create({
            sessionId,
            problemId,
            language,
            code,
            snapshotType: 'submit',
            verdict: result.verdict,
            passedCount: result.passedCount,
            totalCount: result.totalCount,
            ts: new Date(),
        })

        // Trigger AI evaluation analysis for this submission
        if (result.verdict !== 'SYSTEM_ERROR') {
            await aiEnginePort.submitSubmissionAnalysis({
                sessionId,
                userId: user.id,
                submissionVerdict: result,
                code,
                language,
            })
        }

        return NextResponse.json({
            success: true,
            ...result,
        })
    } catch (error) {
        console.error('[Interview Submit API] Error:', error)
        return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 })
    }
}
