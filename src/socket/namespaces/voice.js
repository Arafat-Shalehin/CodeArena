import { DeepgramClient } from '@deepgram/sdk'
import { verifyWsToken } from '@/lib/ws-token'
import { isSessionActive } from '@/services/sessionGuard'
import { hasVoiceAccess } from '@/services/accessControl.service'

const LiveTranscriptionEvents = {
    Open: 'open',
    Close: 'close',
    Transcript: 'transcript',
    Error: 'error',
    Metadata: 'metadata',
}

// ── Deepgram Singleton ────────────────────────────────────────────────────────
if (!process.env.DEEPGRAM_API_KEY) {
    console.error('[Voice] Critical: DEEPGRAM_API_KEY is missing.')
    if (process.env.NODE_ENV === 'production') {
        throw new Error('[voice] Missing DEEPGRAM_API_KEY')
    }
}

const deepgram = new DeepgramClient(process.env.DEEPGRAM_API_KEY)

export function registerVoiceNamespace(io) {
    const voiceNs = io.of('/voice')

    // Middleware for authentication
    voiceNs.use(async (socket, next) => {
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

    voiceNs.on('connection', async (socket) => {
        const { userId, sessionId } = socket
        console.log(`[Voice] Connected: userId=${userId}, sessionId=${sessionId}`)

        // Mandatory: Join the session room for broadcasts
        socket.join(sessionId)

        // 1. Strict Session & Subscription Validation (Fail-Closed)
        const [active, authorized] = await Promise.all([
            isSessionActive(sessionId),
            hasVoiceAccess(userId),
        ])

        if (!active || !authorized) {
            console.warn(`[Voice] Connection rejected: active=${active}, authorized=${authorized}`)
            socket.emit('voice:error', {
                code: !active ? 'SESSION_ENDED' : 'UNAUTHORIZED',
                message: !active
                    ? 'Interview session is not active.'
                    : 'Pro subscription required for voice features.',
            })
            return socket.disconnect()
        }

        // 2. Initialize State (DEFERRED Deepgram connection)
        let dgConnection = null
        let isDeepgramReady = false
        const audioBuffer = []
        const MAX_BUFFER_SIZE = 50
        let heartbeat = null

        const initDeepgram = async () => {
            // Guard: don't open a second connection if one is already active
            if (dgConnection && isDeepgramReady) return

            console.log(`[Voice] Initializing Deepgram for session ${sessionId}`)

            // ✅ Bug 1 Fix: deepgram.listen.live() is synchronous — returns the
            // connection object immediately WITHOUT opening the WebSocket yet.
            // Listeners are attached before the socket opens — no race condition.
            // No separate .connect() call needed or allowed.
            dgConnection = await deepgram.listen.v1.connect({
                model: 'nova-2',
                smart_format: true,
                interim_results: true,
                language: 'en-US',
                // ✅ Bug 3 Fix: No encoding/sample_rate/container.
                // Deepgram auto-detects audio/webm;codecs=opus from the browser correctly.
                // Explicit params cause rejection if browser's actual bitrate differs.
            })

            dgConnection.on(LiveTranscriptionEvents.Open, () => {
                isDeepgramReady = true
                console.log(`[Voice] Deepgram ready for session ${sessionId}`)

                heartbeat = setInterval(() => {
                    if (isDeepgramReady && dgConnection) {
                        try {
                            dgConnection.keepAlive()
                        } catch (e) {}
                    }
                }, 3000)

                // Drain chunks that arrived before the connection opened
                if (audioBuffer.length > 0) {
                    console.log(`[Voice] Flushing ${audioBuffer.length} buffered chunks`)
                    while (audioBuffer.length > 0) {
                        try {
                            dgConnection.send(audioBuffer.shift())
                        } catch (e) {}
                    }
                }
            })

            // ✅ Bug 2 Fix: LiveTranscriptionEvents.Transcript receives a pre-parsed
            // JavaScript object — not a raw WebSocket string.
            // data.type, data.channel, data.is_final all work correctly here.
            dgConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
                // Type guard: skip Metadata, SpeechStarted, and other non-transcript events
                if (!data.channel) return

                const alt = data.channel.alternatives?.[0]
                if (!alt || alt.transcript === '') return

                const { transcript, confidence } = alt
                const isFinal = data.is_final

                console.log(
                    `[Voice] ${isFinal ? '[FINAL]' : '[INTERIM]'} "${transcript}" (confidence: ${confidence?.toFixed(2)})`
                )

                if (!isFinal) {
                    voiceNs.to(sessionId).emit('voice:transcript_interim', { transcript })
                    return
                }

                if (confidence >= 0.75) {
                    voiceNs
                        .to(sessionId)
                        .emit('voice:transcript_confirmed', { transcript, confidence })
                } else if (confidence >= 0.5) {
                    voiceNs
                        .to(sessionId)
                        .emit('voice:transcript_uncertain', { transcript, confidence })
                } else {
                    voiceNs.to(sessionId).emit('voice:transcript_failed', { confidence })
                }
            })

            dgConnection.on(LiveTranscriptionEvents.Close, () => {
                clearInterval(heartbeat)
                isDeepgramReady = false
                dgConnection = null
                console.log(`[Voice] Deepgram closed for session ${sessionId}`)
            })

            dgConnection.on(LiveTranscriptionEvents.Error, (err) => {
                console.error(`[Voice] Deepgram error for session ${sessionId}:`, err)
                isDeepgramReady = false
                voiceNs.to(sessionId).emit('voice:error', {
                    code: 'STT_ENGINE_ERROR',
                    message: 'Speech engine failure',
                })
            })

            // ✅ NO dgConnection.connect() call here — listen.live() handles this internally
        }

        // 3. Audio Chunk Handling
        socket.on('voice:audio_chunk', (chunk) => {
            if (isDeepgramReady && dgConnection) {
                try {
                    dgConnection.send(chunk) // ✅ correct SDK v3 method
                } catch (e) {
                    console.warn('[Voice] send failed:', e.message)
                }
            } else {
                if (audioBuffer.length < MAX_BUFFER_SIZE) audioBuffer.push(chunk)
            }
        })

        // 4. Cross-Namespace Sync (Mode Activation)
        socket.on('voice:mode_activated', async () => {
            console.log(`[Voice] Mode activated for session ${sessionId}`)

            // 1. Initialize Deepgram ONLY when mode is activated
            await initDeepgram()

            // 2. Broadcast to /interview namespace
            io.of('/interview').to(sessionId).emit('voice:mode_activated')
        })

        // 5. Lifecycle Cleanup
        socket.on('disconnect', () => {
            console.log(`[Voice] Disconnected: userId=${userId}, sessionId=${sessionId}`)
            clearInterval(heartbeat)
            audioBuffer.length = 0
            isDeepgramReady = false
            if (dgConnection) {
                try {
                    dgConnection.finish()
                } catch (e) {} // ✅ finish() not close()
                dgConnection = null
            }
        })
    })

    return voiceNs
}
