/**
 * Interview Socket Namespace — /interview
 *
 * Architecture:
 *  - Auth: JWT wsToken verification via middleware
 *  - AI Chat: offloaded to `interview-ai` BullMQ queue (interviewAI.worker.js),
 *             results streamed back to this socket via Redis Pub/Sub
 *  - Code Run/Submit: direct Docker executor call (latency is bounded)
 *  - Snapshots: direct DB write
 */

import { verifyWsToken } from '@/lib/auth/wsToken'
import { InterviewSession } from '@/models/InterviewSession.model'
import { InterviewMessage } from '@/models/InterviewMessage.model'
import { InterviewSnapshot } from '@/models/InterviewSnapshot.model'
import { Problem } from '@/models/Problem.models'
import dbConnect from '@/lib/mongodb'
import { executeCode } from '@/lib/docker/executor'
import { getInterviewAIQueue } from '@/lib/queue'
import { interviewAIChannel } from '@/services/interviewAI.worker'
import { createClient } from 'redis'

// ── Dedicated subscriber factory ───────────────────────────────────────────────
// Each connected socket gets its own subscriber client so it can subscribe to
// its session channel without interfering with other connections.

const redisUrl = process.env.REDIS_URL || ''
const redisConfig = redisUrl
    ? { url: redisUrl }
    : {
          socket: {
              host: process.env.REDIS_HOST || 'localhost',
              port: parseInt(process.env.REDIS_PORT || '6379'),
          },
          password: process.env.REDIS_PASSWORD || undefined,
      }

async function createSubscriber() {
    const client = createClient(redisConfig)
    client.on('error', (err) => console.error('[Interview NS] Redis sub error:', err))
    await client.connect()
    return client
}

// ── Namespace ──────────────────────────────────────────────────────────────────

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

            socket.userId = decoded.userId
            socket.sessionId = decoded.sessionId
            next()
        } catch (error) {
            next(new Error('Authentication error: ' + error.message))
        }
    })

    interviewNs.on('connection', async (socket) => {
        const sessionId = socket.sessionId
        const roomName = `interview:${sessionId}`

        console.log(
            `[Socket.IO /interview] User ${socket.userId} connected to session ${sessionId}`
        )

        // ── Redis subscriber for this socket ───────────────────────────────────
        // Creates one Redis subscriber per socket connection that listens on the
        // session's AI pub/sub channel and forwards chunks to the client.
        let subscriber = null
        try {
            subscriber = await createSubscriber()
            await subscriber.subscribe(interviewAIChannel(sessionId), (message) => {
                try {
                    const parsed = JSON.parse(message)
                    socket.emit('interview:ai_stream_chunk', parsed)
                } catch {
                    // Malformed message — ignore
                }
            })
        } catch (err) {
            console.error(`[Interview NS] Failed to subscribe for session ${sessionId}:`, err)
        }

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

        // 5. Client sends a chat message → enqueue AI job
        socket.on('interview:chat_message', async (payload) => {
            try {
                await dbConnect()
                const { content, phase } = payload

                // a. Persist the user turn immediately so the worker sees it
                await InterviewMessage.create({
                    sessionId,
                    role: 'user',
                    phase: phase || 'coding',
                    content,
                    ts: new Date(),
                })

                // b. Enqueue the AI processing job
                //    The worker will publish chunks to the Redis channel this
                //    socket is already subscribed to → client gets the stream.
                const queue = getInterviewAIQueue()
                await queue.add('process-chat', {
                    sessionId,
                    userId: socket.userId,
                    content,
                    phase: phase || 'coding',
                })
            } catch (error) {
                console.error('[Socket.IO] Chat enqueue error:', error)
                socket.emit('interview:ai_stream_chunk', {
                    chunk: 'Sorry, I hit a snag. Please try again.',
                    done: true,
                })
            }
        })

        // Clean up subscriber on disconnect
        socket.on('disconnect', async () => {
            console.log(
                `[Socket.IO /interview] User ${socket.userId} disconnected from session ${sessionId}`
            )
            if (subscriber) {
                try {
                    await subscriber.unsubscribe(interviewAIChannel(sessionId))
                    await subscriber.quit()
                } catch {
                    // Ignore cleanup errors
                }
            }
        })
    })

    return interviewNs
}
