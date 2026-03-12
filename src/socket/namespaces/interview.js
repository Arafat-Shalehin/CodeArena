import { verifyWsToken } from '@/lib/auth/wsToken'
import { InterviewSession } from '@/models/InterviewSession.model'
import { InterviewMessage } from '@/models/InterviewMessage.model'
import { InterviewSnapshot } from '@/models/InterviewSnapshot.model'
import { Problem } from '@/models/Problem.models'
import dbConnect from '@/lib/mongodb'
import { generateInterviewChatResponse } from '@/lib/ai/interviewGroqClient'
import { executeCode } from '@/lib/docker/executor'
import { buildPrompt } from '@/services/aiConversation.service'

export function registerInterviewNamespace(io) {
    const interviewNs = io.of('/interview')

    // Middleware for authentication
    interviewNs.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token
            if (!token) {
                return next(new Error('Authentication error: Token missing'))
            }

            const decoded = verifyWsToken(token)
            if (!decoded || !decoded.sessionId || !decoded.userId) {
                return next(new Error('Authentication error: Invalid token'))
            }

            // Optional: Connect to DB and verify active session here if needed
            // For performance, the token implies active if within 15 mins.

            socket.userId = decoded.userId
            socket.sessionId = decoded.sessionId
            next()
        } catch (error) {
            next(new Error('Authentication error: ' + error.message))
        }
    })

    interviewNs.on('connection', (socket) => {
        const sessionId = socket.sessionId
        const roomName = `interview:${sessionId}`

        console.log(
            `[Socket.IO /interview] User ${socket.userId} connected to session ${sessionId}`
        )

        // 1. Client joins their dedicated session room
        socket.on('interview:join', async () => {
            socket.join(roomName)
            console.log(`[Socket.IO /interview] Socket joined room: ${roomName}`)
        })

        // 2. Client sends a code snapshot (for playback/history)
        socket.on('interview:code_snapshot', async (payload) => {
            try {
                await dbConnect()
                const { problemId, language, code, snapshotType } = payload

                await InterviewSnapshot.create({
                    sessionId,
                    problemId,
                    language,
                    code,
                    snapshotType: snapshotType || 'auto',
                    ts: new Date(),
                })
            } catch (error) {
                console.error('[Socket.IO] Failed to save code snapshot:', error)
            }
        })

        // 3. Client attempts to run code
        socket.on('interview:run', async (payload) => {
            try {
                await dbConnect()
                const { code, language, problemId } = payload

                const problem = await Problem.findById(problemId)
                if (!problem) throw new Error('Problem not found')

                const input = problem.sampleTestCases?.[0]?.input || ''
                const expectedOutput = problem.sampleTestCases?.[0]?.output || ''

                const result = await executeCode({
                    code,
                    language,
                    input,
                    expectedOutput,
                    timeLimit: problem.timeLimit,
                    memoryLimit: problem.memoryLimit,
                })

                socket.emit('interview:run_result', result)
            } catch (error) {
                console.error('[Socket.IO] Run Error:', error)
                socket.emit('interview:run_result', {
                    success: false,
                    verdict: 'SYSTEM_ERROR',
                    error: error.message,
                })
            }
        })

        // 4. Client attempts to submit code
        socket.on('interview:submit', async (payload) => {
            try {
                await dbConnect()
                const { code, language, problemId } = payload

                const problem = await Problem.findById(problemId)
                if (!problem) throw new Error('Problem not found')

                // For interview submissions, we evaluate against all test cases
                // but for live feedback, we can return the result of the first failing or overall status.
                const testCases = [...(problem.sampleTestCases || []), ...(problem.testCases || [])]

                let overallResult = {
                    success: true,
                    verdict: 'SUCCESS',
                    passedCount: 0,
                    totalCount: testCases.length,
                }

                for (const tc of testCases) {
                    const res = await executeCode({
                        code,
                        language,
                        input: tc.input,
                        expectedOutput: tc.output,
                        timeLimit: problem.timeLimit,
                        memoryLimit: problem.memoryLimit,
                    })

                    if (!res.success || res.verdict !== 'SUCCESS') {
                        overallResult = {
                            ...res,
                            passedCount: overallResult.passedCount,
                            totalCount: testCases.length,
                        }
                        break
                    }
                    overallResult.passedCount++
                }

                socket.emit('interview:submission_result', overallResult)
            } catch (error) {
                console.error('[Socket.IO] Submit Error:', error)
                socket.emit('interview:submission_result', {
                    success: false,
                    verdict: 'SYSTEM_ERROR',
                    error: error.message,
                })
            }
        })

        // 5. Client sends a chat message directly to AI
        socket.on('interview:chat_message', async (payload) => {
            try {
                await dbConnect()
                const { content, phase } = payload

                // 1. Save user message to DB
                await InterviewMessage.create({
                    sessionId,
                    role: 'user',
                    phase: phase || 'coding',
                    content,
                    ts: new Date(),
                })

                // 2. Fetch context for AI
                const [session, history, lastSnapshot] = await Promise.all([
                    InterviewSession.findById(sessionId).populate('problemIds'),
                    InterviewMessage.find({ sessionId }).sort({ ts: 1 }).limit(12),
                    InterviewSnapshot.findOne({ sessionId }).sort({ ts: -1 }),
                ])

                const problem = session?.problemIds?.[0]
                if (!problem) return

                // 3. Use AIConversationService to assemble a safe, phase-aware prompt
                const { systemPrompt, messages } = buildPrompt({
                    problemTitle: problem.title,
                    problemDescription: problem.description,
                    currentCode: lastSnapshot?.code || '',
                    language: lastSnapshot?.language || 'python',
                    phase: session.currentPhase || phase || 'coding',
                    userMessage: content,
                    history: history.slice(0, -1), // exclude the just-saved turn
                })

                // 4. Stream response using the pre-assembled prompt
                const aiStream = generateInterviewChatResponse({
                    systemPrompt,
                    messages,
                })

                let fullResponse = ''
                for await (const chunk of aiStream) {
                    fullResponse += chunk
                    socket.emit('interview:ai_stream_chunk', { chunk, done: false })
                }

                // 5. Save final AI message and signify completion
                await InterviewMessage.create({
                    sessionId,
                    role: 'ai',
                    phase: session.currentPhase || phase || 'coding',
                    content: fullResponse,
                    ts: new Date(),
                })
                socket.emit('interview:ai_stream_chunk', { chunk: '', done: true })
            } catch (error) {
                console.error('[Socket.IO] AI Chat Error:', error)
                socket.emit('interview:ai_stream_chunk', {
                    chunk: 'Sorry, I hit a snag. Please try again.',
                    done: true,
                })
            }
        })

        socket.on('disconnect', () => {
            console.log(
                `[Socket.IO /interview] User ${socket.userId} disconnected from session ${sessionId}`
            )
        })
    })

    return interviewNs
}
