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
import { getInterviewAIQueue, getInterviewExecutionQueue } from '@/lib/queue'
import { interviewAIChannel } from '@/services/interviewAI.worker'
import { interviewExecutionChannel } from '@/services/interviewExecution.worker'
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

let sharedSubscriber = null
const sessionRefCount = new Map()

async function getSharedSubscriber() {
    if (sharedSubscriber) return sharedSubscriber
    const client = createClient(redisConfig)
    client.on('error', (err) => console.error('[Interview NS] Redis shared sub error:', err))
    await client.connect()
    sharedSubscriber = client
    return sharedSubscriber
}

function createSubscriber() {
    // Legacy function, no longer used per-socket
    return getSharedSubscriber()
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

        // ── Shared Redis subscriber for this namespace ──────────────────────────
        // Subscribes once per sessionId and broadcasts to the session room.
        try {
            const sub = await getSharedSubscriber()
            const channel = interviewAIChannel(sessionId)

            // Increment ref count
            const currentCount = sessionRefCount.get(sessionId) || 0
            sessionRefCount.set(sessionId, currentCount + 1)

            if (currentCount === 0) {
                const aiChannel = interviewAIChannel(sessionId)
                const execChannel = interviewExecutionChannel(sessionId)

                console.log(
                    `[Interview NS] Subscribing to Redis channels: ${aiChannel}, ${execChannel}`
                )

                // Subscription handler
                const messageHandler = (message, channel) => {
                    try {
                        const parsed = JSON.parse(message)
                        const ns = interviewNs
                        const targetRoom = `interview:${sessionId}`

                        // a. AI Related events
                        if (channel === aiChannel) {
                            if (parsed.analysis) {
                                ns.to(targetRoom).emit('interview:ai_analysis', parsed)
                            } else if (parsed.scorecard) {
                                ns.to(targetRoom).emit('interview:scorecard', parsed.scorecard)
                            } else if (parsed.phase) {
                                ns.to(targetRoom).emit('interview:phase_change', parsed.phase)
                            } else if (parsed.chunk !== undefined) {
                                ns.to(targetRoom).emit('interview:ai_stream_chunk', parsed)
                            }
                        }

                        // b. Code Execution events
                        if (channel === execChannel) {
                            if (parsed.jobType === 'run') {
                                ns.to(targetRoom).emit('interview:run_result', parsed.result)
                            } else if (parsed.jobType === 'submit') {
                                ns.to(targetRoom).emit('interview:submission_result', parsed.result)
                            }
                        }
                    } catch (err) {
                        console.error('[Interview NS] Message parsing error:', err)
                    }
                }

                await sub.subscribe(aiChannel, messageHandler)
                await sub.subscribe(execChannel, messageHandler)
            }
        } catch (err) {
            console.error(
                `[Interview NS] Failed to manage subscription for session ${sessionId}:`,
                err
            )
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

        // 3. Client attempts to run code (Refactored to Background Worker)
        socket.on('interview:run', async (payload) => {
            try {
                const { code, language, problemId } = payload
                const queue = getInterviewExecutionQueue()

                await queue.add('run', {
                    sessionId,
                    userId: socket.userId,
                    code,
                    language,
                    problemId,
                    jobType: 'run',
                })

                // Note: Result will come via Redis Pub/Sub subscriber
            } catch (error) {
                console.error('[Socket.IO] Run Enqueue Error:', error)
                socket.emit('interview:run_result', {
                    success: false,
                    verdict: 'SYSTEM_ERROR',
                    error: 'Failed to enqueue execution job.',
                })
            }
        })

        // 4. Client attempts to submit code (Refactored to Background Worker)
        socket.on('interview:submit', async (payload) => {
            try {
                await dbConnect()
                const { code, language, problemId } = payload
                const session = await InterviewSession.findById(sessionId)

                if (session.currentPhase !== 'coding') {
                    return socket.emit('interview:submission_result', {
                        success: false,
                        verdict: 'SKIPPED',
                        error: 'Submission is only allowed during the coding phase.',
                    })
                }

                const queue = getInterviewExecutionQueue()
                await queue.add('submit', {
                    sessionId,
                    userId: socket.userId,
                    code,
                    language,
                    problemId,
                    jobType: 'submit',
                })

                // Result persistence and AI analysis trigger are now handled by
                // interviewExecution.worker.js to keep this namespace non-blocking.
            } catch (error) {
                console.error('[Socket.IO] Submit Enqueue Error:', error)
                socket.emit('interview:submission_result', {
                    success: false,
                    verdict: 'SYSTEM_ERROR',
                    error: 'Failed to enqueue submission job.',
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

            // Decrement ref count
            const currentCount = sessionRefCount.get(sessionId) || 0
            if (currentCount > 1) {
                sessionRefCount.set(sessionId, currentCount - 1)
            } else {
                sessionRefCount.delete(sessionId)
                if (sharedSubscriber) {
                    try {
                        const aiChannel = interviewAIChannel(sessionId)
                        const execChannel = interviewExecutionChannel(sessionId)
                        console.log(
                            `[Interview NS] Last socket left. Unsubscribing from: ${aiChannel}, ${execChannel}`
                        )
                        await sharedSubscriber.unsubscribe(aiChannel)
                        await sharedSubscriber.unsubscribe(execChannel)
                    } catch (err) {
                        console.error('[Interview NS] Unsubscribe error:', err)
                    }
                }
            }
        })
    })

    return interviewNs
}
