/**
 * Direct Code Execution Endpoint
 * Executes code WITHOUT creating a submission record
 * Used by "Run Code" feature to test code without saving history
 * Rate limit: 3 submissions per 10 seconds per user
 */

import dbConnect from '@/lib/mongodb'
import { protect } from '@/middlewares/auth.middleware'
import { Problem } from '@/models/Problem.models'
import { executeCode } from '@/lib/docker/executor'
import { submissionRateLimitMiddleware } from '@/middlewares/rateLimiter.middleware'

export async function POST(req) {
    try {
        console.log('[EXECUTE API] POST /api/execute called')

        // Connect to database
        await dbConnect()

        // Get auth user FIRST (before rate limiting to check authorization)
        const user = await protect(req)
        console.log('[EXECUTE API] User:', user._id)

        // Apply rate limiting (prevent spam submissions)
        const rateLimitResponse = await submissionRateLimitMiddleware(req, user._id.toString())
        if (rateLimitResponse) return rateLimitResponse

        // Parse JSON body
        const body = await req.json()
        console.log('[EXECUTE API] Body received:', Object.keys(body))

        const { problemId, code, language, customInput, files } = body

        console.log('[EXECUTE API] problemId:', problemId)
        console.log('[EXECUTE API] code length:', code?.length)
        console.log('[EXECUTE API] language:', language)

        // Validate input
        if (!problemId || !code || !language) {
            console.error('[EXECUTE API] Missing required fields')
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'problemId, code, and language are required',
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Fetch problem to get limits
        const problem = await Problem.findById(problemId)
        if (!problem) {
            return new Response(JSON.stringify({ success: false, message: 'Problem not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        console.log('[EXECUTE API] Problem found:', problem.title)
        console.log('[EXECUTE API] Executing code...')

        // Execute the code with custom input (Playground/Run mode - NO JUDGING)
        // This is just to test the code, not for actual evaluation
        // isPlayground=true means verdict will be EXECUTED, not ACCEPTED (no judging)
        const result = await executeCode({
            code,
            files: files && files.length > 1 ? files : undefined,
            language,
            input: customInput || '',
            timeLimit: problem.timeLimit,
            memoryLimit: problem.memoryLimit,
            isPlayground: true, // This converts ACCEPTED to EXECUTED
        })

        console.log('[EXECUTE API] Execution result:', {
            verdict: result.verdict,
            success: result.success,
            executionTime: result.executionTime,
        })

        // Return result directly (no submission record created, no judging against test cases)
        return new Response(
            JSON.stringify({
                success: true,
                message: 'Code execution completed',
                result: {
                    verdict: result.verdict,
                    executionTime: result.executionTime || 0,
                    memoryUsed: result.memoryUsed || 0,
                    output: result.output || '',
                    error: result.error || '',
                },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('[EXECUTE API] Error:', error.message)
        console.error('[EXECUTE API] Stack:', error.stack)
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Code execution failed: ' + error.message,
                verdict: 'SYSTEM_ERROR',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
}
