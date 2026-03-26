import { DeepgramClient } from '@deepgram/sdk'
import { verifyWsToken } from '@/lib/auth/wsToken'
import { isSessionActive } from '@/services/sessionGuard'
import { hasVoiceAccess } from '@/services/accessControl.service'

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

        // 2. Initialize Deepgram Live Connection
        let dgConnection = null
        let isDeepgramReady = false
        const audioBuffer = []
        const MAX_BUFFER_SIZE = 50

        const initDeepgram = async () => {
            console.log(`[Voice] Initializing new Deepgram connection for session ${sessionId}`)
            try {
                dgConnection = await deepgram.listen.v1.connect({
                    model: 'nova-2',
                    smart_format: true,
                    interim_results: true,
                    // Explicitly define format to survive header loss during reconnections
                    encoding: 'opus',
                    sample_rate: 48000,
                    container: 'webm',
                })

                // 1. ATTACH LISTENERS IMMEDIATELY (Before connect())
                dgConnection.on('message', (data) => {
                    try {
                        const isTranscript = data.channel?.alternatives?.length > 0
                        if (isTranscript) {
                            const alt = data.channel.alternatives[0]
                            const transcript = alt.transcript
                            const isFinal = data.is_final

                            if (transcript) {
                                console.log(
                                    `[Voice] ${isFinal ? '[FINAL]' : '[INTERIM]'} : "${transcript}"`
                                )
                                if (isFinal) {
                                    voiceNs.to(sessionId).emit('voice:transcript_confirmed', {
                                        transcript,
                                        confidence: alt.confidence,
                                    })
                                } else {
                                    voiceNs.to(sessionId).emit('voice:transcript_interim', {
                                        transcript,
                                        confidence: alt.confidence,
                                    })
                                }
                            }
                        }
                    } catch (err) {
                        console.error('[Voice] Message processing error:', err)
                    }
                })

                // Heartbeat to keep the connection alive during silence (Deepgram timeout is usually 10s)
                const heartbeat = setInterval(() => {
                    if (dgConnection && isDeepgramReady) {
                        try {
                            dgConnection.sendKeepAlive()
                        } catch (e) {
                            console.warn('[Voice] Heartbeat failed:', e.message)
                        }
                    }
                }, 3000)

                dgConnection.on('close', (event) => {
                    clearInterval(heartbeat)
                    isDeepgramReady = false
                    dgConnection = null
                    console.log(
                        `[Voice] Deepgram WS closed for session ${sessionId}. Code: ${event.code}, Reason: ${event.reason}`
                    )
                })

                dgConnection.on('error', (err) => {
                    console.error(`[Voice] Deepgram WS error in session ${sessionId}:`, err)
                    isDeepgramReady = false
                    voiceNs.to(sessionId).emit('voice:error', {
                        code: 'STT_ENGINE_ERROR',
                        message: 'Speech engine failure',
                    })
                })

                // 2. INITIATE CONNECTION
                console.log(`[Voice] Starting Deepgram connection for session ${sessionId}...`)
                dgConnection.connect()

                // 3. WAIT FOR OPEN WITH TIMEOUT
                const openPromise = dgConnection.waitForOpen()
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Deepgram connection timeout (5s)')), 5000)
                )

                try {
                    await Promise.race([openPromise, timeoutPromise])
                    isDeepgramReady = true
                    console.log(`[Voice] Deepgram WS opened successfully for session ${sessionId}`)

                    // Flush buffer
                    if (audioBuffer.length > 0) {
                        console.log(`[Voice] Flushing ${audioBuffer.length} buffered chunks`)
                        while (audioBuffer.length > 0) {
                            dgConnection.sendMedia(audioBuffer.shift())
                        }
                    }
                } catch (timeoutErr) {
                    console.error(`[Voice] Connection failed/timed out:`, timeoutErr.message)
                    voiceNs.to(sessionId).emit('voice:error', {
                        code: 'STT_TIMEOUT',
                        message: 'Connection to speech engine timed out.',
                    })
                }
            } catch (err) {
                console.error(`[Voice] Failed to connect to Deepgram:`, err)
                voiceNs.to(sessionId).emit('voice:error', {
                    code: 'STT_INIT_FAILED',
                    message: 'Failed to initialize speech engine',
                })
            }
        }

        await initDeepgram()

        // 3. Audio Chunk Handling
        socket.on('voice:audio_chunk', (chunk) => {
            // Log chunk arrival
            if (audioBuffer.length % 20 === 0) {
                console.log(`[Voice] Audio streaming... (buffer=${audioBuffer.length})`)
            }

            if (dgConnection && isDeepgramReady) {
                dgConnection.sendMedia(chunk)
            } else {
                // Buffer chunks until ready
                if (audioBuffer.length >= MAX_BUFFER_SIZE) {
                    audioBuffer.shift() // Drop OLDEST chunk
                }
                audioBuffer.push(chunk)
            }
        })

        // 4. Cross-Namespace Sync (Mode Activation)
        socket.on('voice:mode_activated', () => {
            console.log(`[Voice] Mode activated for session ${sessionId}`)
            // Broadcast to /interview namespace as well
            io.of('/interview').to(sessionId).emit('voice:mode_activated')
        })

        // 5. Lifecycle Cleanup
        socket.on('disconnect', () => {
            console.log(`[Voice] Disconnected: userId=${userId}, sessionId=${sessionId}`)
            if (dgConnection) {
                dgConnection.close()
                dgConnection = null
            }
            audioBuffer.length = 0 // Clear references
        })
    })

    return voiceNs
}
