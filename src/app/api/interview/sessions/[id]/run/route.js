import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { InterviewSession } from '@/models/InterviewSession.model'
import { Problem } from '@/models/Problem.models'
import { protect } from '@/middlewares/auth.middleware'
import { executeCode } from '@/lib/docker/executor'

const VERDICTS = {
    SUCCESS: 'SUCCESS',
    WRONG_ANSWER: 'WRONG_ANSWER',
    COMPILATION_ERROR: 'COMPILATION_ERROR',
    RUNTIME_ERROR: 'RUNTIME_ERROR',
    TIME_LIMIT_EXCEEDED: 'TIME_LIMIT_EXCEEDED',
    MEMORY_LIMIT_EXCEEDED: 'MEMORY_LIMIT_EXCEEDED',
    SYSTEM_ERROR: 'SYSTEM_ERROR',
    SECURITY_ERROR: 'SECURITY_ERROR',
    EXECUTED: 'EXECUTED',
}

function simulateExecution(code) {
    let finalVerdict = VERDICTS.EXECUTED
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

    return {
        success: finalVerdict === VERDICTS.EXECUTED,
        verdict: finalVerdict,
        output: finalVerdict === VERDICTS.EXECUTED ? 'Mock execution completed successfully.' : '',
        error: firstError,
        time: 50,
        memory: 2048,
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
            result = simulateExecution(code)
        } else {
            try {
                const input = problem.sampleTestCases?.[0]?.input || ''
                const expectedOutput = problem.sampleTestCases?.[0]?.output || ''

                result = await executeCode({
                    code,
                    language,
                    input,
                    expectedOutput,
                    timeLimit: problem.timeLimit,
                    memoryLimit: problem.memoryLimit,
                    isPlayground: true,
                })
            } catch (err) {
                console.warn('[Interview Run API] Docker execution failed, falling back to simulation:', err)
                result = simulateExecution(code)
            }
        }

        return NextResponse.json({
            success: true,
            ...result,
        })
    } catch (error) {
        console.error('[Interview Run API] Error:', error)
        return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 })
    }
}
