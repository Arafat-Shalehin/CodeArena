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
import { isSessionActive } from '@/services/sessionGuard'

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

// ── Singleton Redis Pattern Subscriber (Production-Grade) ───────────────────
const sessionSockets = new Map()
let sharedSubscriber = null
let subscriberPromise = null
let isSubscribed = false

/**
 * Initializes a single Redis pattern subscriber for the entire namespace.
 * Uses a promise-based singleton pattern to prevent duplicate clients under load.
 */
async function getSharedSubscriber(io) {
    if (sharedSubscriber && isSubscribed) return sharedSubscriber
    if (subscriberPromise) return subscriberPromise

    subscriberPromise = (async () => {
        try {
            console.log('[RedisSubscriber] Initializing singleton pattern subscriber...')
            const sub = createClient(redisConfig)

            sub.on('error', (err) => {
                console.error('[RedisSubscriber] Fatal connection error:', err)
                // Reset singleton so it can be re-initialized on the next attempt
                sharedSubscriber = null
                subscriberPromise = null
                isSubscribed = false
            })

            sub.on('reconnecting', () => {
                console.warn('[RedisSubscriber] Connection lost, reconnecting...')
            })

            sub.on('ready', async () => {
                console.log(
                    '[RedisSubscriber] Connection ready, establishing pattern subscriptions...'
                )
                try {
                    // IDEMPOTENCY GUARD: Ensure we don't stack subscriptions on flapping connections
                    if (isSubscribed) {
                        console.log('[RedisSubscriber] Already subscribed, skipping pSubscribe.')
                        return
                    }

                    await sub.pSubscribe('interview:ai:*', (message, channel) => {
                        handleSharedMessage(io, message, channel, 'ai')
                    })
                    await sub.pSubscribe('interview:execution:*', (message, channel) => {
                        handleSharedMessage(io, message, channel, 'execution')
                    })

                    isSubscribed = true
                    console.log('[RedisSubscriber] Global pattern subscriptions active.')
                } catch (subErr) {
                    console.error(
                        '[RedisSubscriber] Failed to establish pattern subscriptions:',
                        subErr
                    )
                }
            })

            await sub.connect()
            sharedSubscriber = sub
            return sub
        } catch (err) {
            console.error('[RedisSubscriber] Initialization failed:', err)
            subscriberPromise = null
            throw err
        }
    })()

    return subscriberPromise
}

/**
 * Unified message dispatcher for the singleton subscriber.
 * Extracts sessionId from the Redis channel and emits to the correct Socket.IO room.
 */
function handleSharedMessage(io, message, channel, type) {
    try {
        const parsed = JSON.parse(message)
        const parts = channel.split(':')
        const targetSessionId = parts[parts.length - 1] // Channel format: interview:type:sessionId

        if (type === 'ai') {
            if (parsed.type === 'error') {
                io.to(targetSessionId).emit('interview:ai_error', parsed)
            } else if (parsed.analysis) {
                io.to(targetSessionId).emit('interview:ai_analysis', parsed)
            } else if (parsed.scorecard) {
                io.to(targetSessionId).emit('interview:scorecard', parsed.scorecard)
            } else if (parsed.phase) {
                io.to(targetSessionId).emit('interview:phase_change', parsed.phase)
            } else if (parsed.chunk !== undefined) {
                io.to(targetSessionId).emit('interview:ai_stream_chunk', parsed)
            }
        } else if (type === 'execution') {
            if (parsed.jobType === 'run') {
                io.to(targetSessionId).emit('interview:run_result', parsed.result)
            } else if (parsed.jobType === 'submit') {
                io.to(targetSessionId).emit('interview:submission_result', parsed.result)
            }
        }
    } catch (err) {
        console.error('[Interview NS] Pattern message parsing error:', err)
    }
}

/**
 * Transitioning away from per-socket subscriptions to global singleton pattern.
 * These helpers are now largely for socket tracking within the process.
 */
async function registerSessionSocket(sessionId, socketId) {
    if (!sessionSockets.has(sessionId)) {
        sessionSockets.set(sessionId, new Set())
    }
    sessionSockets.get(sessionId).add(socketId)
}

async function unregisterSessionSocket(sessionId, socketId) {
    const sockets = sessionSockets.get(sessionId)
    if (!sockets) return

    sockets.delete(socketId)
    if (sockets.size === 0) {
        sessionSockets.delete(sessionId)
        console.log(`[Interview NS] Last local client left session ${sessionId}`)
    }
}

// ── Namespace ──────────────────────────────────────────────────────────────────

export function registerInterviewNamespace(io) {
    const interviewNs = io.of('/interview')

    // Initialize singleton subscriber at startup
    getSharedSubscriber(interviewNs).catch((err) => {
        console.error(
            '[Interview NS] Critical: Redis subscriber failed to initialize:',
            err.message
        )
    })

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
        const roomName = sessionId // Consistent with io.to(sessionId) emits

        console.log(
            `[Socket.IO /interview] User ${socket.userId} connected to session ${sessionId}`
        )

        // --- Heartbeat & Diagnostic Layer ---
        const heartbeat = setInterval(() => {
            socket.emit('interview:ping', { ts: Date.now() })
        }, 25000)

        // Diagnostic only. Used for analytics/health-checks, but NEVER to
        // actively kill a session (sessions are governed strictly by DB/User logic).
        socket.on('interview:pong', () => {
            socket.data.lastPong = Date.now()
        })

        // Force connection into room and register the socket to the Singleton
        socket.join(roomName)
        await registerSessionSocket(sessionId, socket.id)

        // --- Voice Mode Sync ---
        socket.on('voice:mode_activated', () => {
            socket.data.voiceMode = true
            console.log(
                `[Interview NS] Voice mode activated for user ${socket.userId} in session ${sessionId}`
            )
        })

        // --- Intro Phase Sim-Streaming (Execution optimization) ---
        // If this is a fresh session (only 1 message: the intro), sim-stream it to trigger UI animations
        try {
            const messages = await InterviewMessage.find({ sessionId }).sort({ ts: 1 }).limit(2)
            if (
                messages.length === 1 &&
                messages[0].phase === 'intro' &&
                messages[0].role === 'ai'
            ) {
                const greeting = messages[0].content
                socket.emit('interview:ai_stream_chunk', { chunk: greeting, done: false })
                socket.emit('interview:ai_stream_chunk', { done: true })
                console.log(
                    `[Intro] Sim-streamed greeting for user ${socket.userId} in session ${sessionId}`
                )
            }
        } catch (err) {
            console.error('[Intro] Sim-streaming failed:', err.message)
        }

        // 1. Client joins their dedicated session room (redundant due to ^ but kept for backwards comp)
        socket.on('interview:join', async () => {
            socket.join(roomName)
            console.log(`[Socket.IO /interview] Socket joined room: ${roomName}`)
        })

        // 2. Client sends a code snapshot (for playback/history)
        socket.on('interview:code_snapshot', async (payload) => {
            if (!(await isSessionActive(sessionId))) {
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
            if (!(await isSessionActive(sessionId))) {
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
            if (!(await isSessionActive(sessionId))) {
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
            if (!(await isSessionActive(sessionId))) {
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
            clearInterval(heartbeat)
            console.log(
                `[Socket.IO /interview] User ${socket.userId} disconnected from session ${sessionId}`
            )

            // Cleanly sever the socket node's attachment to the redis Singleton listener
            await unregisterSessionSocket(sessionId, socket.id)
        })
    })

    return interviewNs
}
