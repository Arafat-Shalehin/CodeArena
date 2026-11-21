import crypto from 'crypto'
import { verifyWsToken } from '@/lib/ws-token'
import { InterviewSession } from '@/models/InterviewSession.model'
import { InterviewMessage } from '@/models/InterviewMessage.model'
import { InterviewSnapshot } from '@/models/InterviewSnapshot.model'
import { Problem } from '@/models/Problem.models'
import dbConnect from '@/lib/mongodb'
import { executeCode } from '@/lib/docker/executor'
import { getInterviewExecutionQueue } from '@/lib/queue'
import { aiEnginePort } from '@/lib/ai-engine'
import { interviewAIChannel } from '@/services/interviewAI.worker'
import { interviewExecutionChannel } from '@/services/interviewExecution.worker'
import {
    acquireProcessingLock,
    releaseProcessingLock,
    updateActivity,
    TERMINAL_STATUSES,
} from '@/services/interviewSession.service'
import { redisClient } from '@/lib/redis'

let sharedSubscriber = null
const sessionRefCount = new Map()

async function getSharedSubscriber() {
    if (sharedSubscriber) return sharedSubscriber
    const client = redisClient.duplicate()
    client.on('error', (err) => console.error('[Interview NS] Redis shared sub error:', err))
    await client.connect()
    sharedSubscriber = client
    return sharedSubscriber
}

export function registerInterviewNamespace(io) {
    const interviewNs = io.of('/interview')

    // ── Auth middleware ────────────────────────────────────────────────────────
    interviewNs.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token
            if (!token) return next(new Error('Authentication error: Token missing'))

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
            JSON.stringify({
                event: 'SOCKET_CONNECTED',
                sessionId,
                userId: socket.userId,
                timestamp: new Date().toISOString(),
            })
        )

        // ✅ FIX: Join the room immediately on connection.
        // Previously this was gated behind interview:join which meant
        // Redis chunks emitted before that event fired were lost forever.
        socket.join(roomName)
        console.log(`[Interview NS] Socket joined room: ${roomName}`)

        // ✅ FIX: Set up Redis subscription immediately on connection,
        // not inside interview:join. All chunks now reach the room.
        try {
            const sub = await getSharedSubscriber()
            const aiChannel = interviewAIChannel(sessionId)
            const execChannel = interviewExecutionChannel(sessionId)

            const currentCount = sessionRefCount.get(sessionId) || 0
            sessionRefCount.set(sessionId, currentCount + 1)

            if (currentCount === 0) {
                console.log(
                    `[Interview NS] Subscribing to Redis channels: ${aiChannel}, ${execChannel}`
                )

                const messageHandler = (message, channel) => {
                    try {
                        const parsed = JSON.parse(message)
                        const targetRoom = `interview:${sessionId}`

                        if (channel === aiChannel) {
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
                                if (parsed.done) {
                                    releaseProcessingLock(sessionId).catch((err) =>
                                        console.error(
                                            '[Interview NS] releaseProcessingLock error:',
                                            err
                                        )
                                    )
                                }
                            } else if (parsed.terminal) {
                                interviewNs
                                    .to(targetRoom)
                                    .emit('interview:session_terminal', parsed)
                            }
                        }

                        if (channel === execChannel) {
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
                }

                await sub.subscribe(aiChannel, messageHandler)
                await sub.subscribe(execChannel, messageHandler)
            }
        } catch (err) {
            console.error(
                `[Interview NS] Failed to set up subscription for session ${sessionId}:`,
                err
            )
        }

        // ── interview:join kept for client backward compatibility — now a no-op ──
        // The socket is already in the room and Redis is already subscribed above.
        // Do not move any logic back in here.
        socket.on('interview:join', () => {
            // Intentionally empty. Room join and Redis subscription
            // now happen on connection. Client may still emit this event.
        })

        // ── 1. Code snapshot ───────────────────────────────────────────────────
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

        // ── 2. Run code ────────────────────────────────────────────────────────
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
            } catch (error) {
                console.error('[Socket.IO] Run Enqueue Error:', error)
                socket.emit('interview:run_result', {
                    success: false,
                    verdict: 'SYSTEM_ERROR',
                    error: 'Failed to enqueue execution job.',
                })
            }
        })

        // ── 3. Submit code ─────────────────────────────────────────────────────
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
            } catch (error) {
                console.error('[Socket.IO] Submit Enqueue Error:', error)
                socket.emit('interview:submission_result', {
                    success: false,
                    verdict: 'SYSTEM_ERROR',
                    error: 'Failed to enqueue submission job.',
                })
            }
        })

        // ── 4. Chat message ────────────────────────────────────────────────────
        socket.on('interview:chat_message', async (payload) => {
            try {
                await dbConnect()
                const { content, phase, messageId } = payload

                // Fetch the latest session phase to ensure the message is labeled correctly
                const currentSession = await InterviewSession.findById(sessionId).select(
                    'currentPhase isProcessing'
                )
                if (currentSession?.isProcessing) {
                    return socket.emit('error', 'Wait for AI response')
                }

                const lockedSession = await acquireProcessingLock(sessionId)
                if (!lockedSession) {
                    console.log(
                        JSON.stringify({
                            event: 'CHAT_REJECTED_LOCKED',
                            sessionId,
                            userId: socket.userId,
                            timestamp: new Date().toISOString(),
                        })
                    )
                    return socket.emit('interview:ai_stream_chunk', {
                        chunk: '',
                        done: true,
                        error: 'AI is already responding. Please wait.',
                    })
                }

                await InterviewMessage.create({
                    sessionId,
                    role: 'user',
                    phase: currentSession?.currentPhase || 'intro',
                    content,
                    ts: new Date(),
                })

                await updateActivity(sessionId)

                await aiEnginePort.submitChat({
                    sessionId,
                    userId: socket.userId,
                    content,
                    phase: phase || 'coding',
                    messageId,
                })

                console.log(
                    JSON.stringify({
                        event: 'AI_STREAM_ENQUEUED',
                        sessionId,
                        userId: socket.userId,
                        timestamp: new Date().toISOString(),
                    })
                )
            } catch (error) {
                console.error('[Socket.IO] Chat enqueue error:', error)
                releaseProcessingLock(sessionId).catch(() => {})
                socket.emit('interview:ai_stream_chunk', {
                    chunk: 'Sorry, I hit a snag. Please try again.',
                    done: true,
                })
            }
        })

        // ── 5. Disconnect cleanup ──────────────────────────────────────────────
        socket.on('disconnect', async () => {
            console.log(
                JSON.stringify({
                    event: 'SOCKET_DISCONNECTED',
                    sessionId,
                    userId: socket.userId,
                    timestamp: new Date().toISOString(),
                })
            )

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
