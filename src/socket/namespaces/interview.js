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
import dbConnect from '@/lib/mongodb'
import { getInterviewAIQueue, getInterviewExecutionQueue } from '@/lib/queue'
import { interviewAIChannel } from '@/services/interviewAI.worker'
import { interviewExecutionChannel } from '@/services/interviewExecution.worker'
import { createClient } from 'redis'
import { redisClient } from '@/lib/redis'

async function isSessionActive(client, sessionId) {
    try {
        const status = await client.get(`session:status:${sessionId}`)
        return status === 'active'
    } catch (err) {
        // Redis failure fallback: DO NOT block user actions
        console.warn(`[Redis] Failed to check status for ${sessionId}:`, err.message)
        return true
    }
}

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

// sessionId → Set of socketIds
const sessionSockets = new Map()

// sessionId → boolean (subscription active status)
const sessionSubscribed = new Map()

// Ensure message handler is registered exactly once across the Node process
let isMessageHandlerRegistered = false
let sharedSubscriber = null

async function getSharedSubscriber() {
    if (sharedSubscriber) return sharedSubscriber
    const client = createClient(redisConfig)
    client.on('error', (err) => console.error('[Interview NS] Redis shared sub error:', err))
    await client.connect()
    sharedSubscriber = client
    return sharedSubscriber
}

async function registerSessionSocket(sessionId, socketId, interviewNs) {
    if (!sessionSockets.has(sessionId)) {
        sessionSockets.set(sessionId, new Set())
    }

    const sockets = sessionSockets.get(sessionId)
    sockets.add(socketId)

    // Ensure we only have 1 active Redis subscriber per session across all tabs
    if (!sessionSubscribed.get(sessionId)) {
        try {
            const sub = await getSharedSubscriber()

            // Attach the global message handler strictly ONCE
            if (!isMessageHandlerRegistered) {
                sub.on('message', (channel, message) => {
                    try {
                        const parsed = JSON.parse(message)
                        // Extract sessionId from "interview:ai:SESSIONID" or "interview:execution:SESSIONID"
                        const parts = channel.split(':')
                        const targetSessionId = parts[parts.length - 1]
                        const targetRoom = `interview:${targetSessionId}`

                        const isAiChannel = channel.includes(':ai:')
                        const isExecChannel = channel.includes(':execution:')

                        if (isAiChannel) {
                            if (parsed.analysis) {
                                interviewNs.to(targetRoom).emit('interview:ai_analysis', parsed)
                            } else if (parsed.scorecard) {
                                interviewNs
                                    .to(targetRoom)
                                    .emit('interview:scorecard', parsed.scorecard)
                            } else if (parsed.phase) {
                                interviewNs
                                    .to(targetRoom)
                                    .emit('interview:phase_change', parsed.phase)
                            } else if (parsed.chunk !== undefined) {
                                interviewNs.to(targetRoom).emit('interview:ai_stream_chunk', parsed)
                            }
                        } else if (isExecChannel) {
                            if (parsed.jobType === 'run') {
                                interviewNs
                                    .to(targetRoom)
                                    .emit('interview:run_result', parsed.result)
                            } else if (parsed.jobType === 'submit') {
                                interviewNs
                                    .to(targetRoom)
                                    .emit('interview:submission_result', parsed.result)
                            }
                        }
                    } catch (err) {
                        console.error('[Interview NS] Message parsing error:', err)
                    }
                })
                isMessageHandlerRegistered = true
            }

            const aiChannel = interviewAIChannel(sessionId)
            const execChannel = interviewExecutionChannel(sessionId)

            await sub.subscribe(aiChannel)
            await sub.subscribe(execChannel)

            sessionSubscribed.set(sessionId, true)
            console.log(`[Interview NS] Subscribed to session ${sessionId}`)
        } catch (err) {
            console.error('[Interview NS] Redis subscribe error:', err)
        }
    } else {
        console.log(`[Interview NS] Reusing existing subscription for session ${sessionId}`)
    }
}

async function unregisterSessionSocket(sessionId, socketId) {
    const sockets = sessionSockets.get(sessionId)
    if (!sockets) return

    sockets.delete(socketId)

    // Only unsubscribe from Redis when the absolute last browser tab closes
    if (sockets.size === 0) {
        try {
            const sub = await getSharedSubscriber()
            const aiChannel = interviewAIChannel(sessionId)
            const execChannel = interviewExecutionChannel(sessionId)

            await sub.unsubscribe(aiChannel)
            await sub.unsubscribe(execChannel)
            console.log(`[Interview NS] Unsubscribed from session ${sessionId}`)
        } catch (err) {
            console.error(`[Interview NS] Redis unsubscribe error for ${sessionId}:`, err)
        }

        sessionSockets.delete(sessionId)
        sessionSubscribed.delete(sessionId)
    }
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

        // Force connection into room and register the socket to the Singleton
        socket.join(roomName)
        await registerSessionSocket(sessionId, socket.id, interviewNs)

        // 1. Client joins their dedicated session room (redundant due to ^ but kept for backwards comp)
        socket.on('interview:join', async () => {
            socket.join(roomName)
            console.log(`[Socket.IO /interview] Socket joined room: ${roomName}`)
        })

        // 2. Client sends a code snapshot (for playback/history)
        socket.on('interview:code_snapshot', async (payload) => {
            if (!(await isSessionActive(redisClient, sessionId))) {
                console.warn(`[Guard Blocked] code_snapshot on session ${sessionId}`)
                return
            }

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
            if (!(await isSessionActive(redisClient, sessionId))) {
                console.warn(`[Guard Blocked] run on session ${sessionId}`)
                socket.emit('interview:error', {
                    code: 'SESSION_ENDED',
                    message: 'This session has ended. Please start a new session.',
                })
                return
            }

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
            if (!(await isSessionActive(redisClient, sessionId))) {
                console.warn(`[Guard Blocked] submit on session ${sessionId}`)
                socket.emit('interview:error', {
                    code: 'SESSION_ENDED',
                    message: 'This session has ended. Please start a new session.',
                })
                return
            }

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
            if (!(await isSessionActive(redisClient, sessionId))) {
                console.warn(`[Guard Blocked] chat_message on session ${sessionId}`)
                socket.emit('interview:error', {
                    code: 'SESSION_ENDED',
                    message: 'This session has ended. Please start a new session.',
                })
                return
            }

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

            // Cleanly sever the socket node's attachment to the redis Singleton listener
            await unregisterSessionSocket(sessionId, socket.id)
        })
    })

    return interviewNs
}
