import { verifyWsToken } from '@/lib/auth/wsToken'
import { InterviewSession } from '@/models/InterviewSession.model'
import { InterviewMessage } from '@/models/InterviewMessage.model'
import { InterviewSnapshot } from '@/models/InterviewSnapshot.model'
import dbConnect from '@/lib/mongodb'

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
            // Trigger run evaluation pipeline here
            // Placeholder for now. It should ideally call submission queue and emit back `interview:run_result`
            console.log(`[Socket.IO /interview] Code run requested for session ${sessionId}`)
        })

        // 4. Client attempts to submit code
        socket.on('interview:submit', async (payload) => {
            // Trigger submission pipeline here
            // Placeholder for now. It should ideally call submission queue and emit back `interview:submission_result`
            console.log(`[Socket.IO /interview] Code submit requested for session ${sessionId}`)
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

                // 2. Trigger asynchronous AI task (e.g. BullMQ job)
                // Placeholder: Here we would trigger the AI worker which would then stream back via `interview:ai_stream_chunk`
                console.log(`[Socket.IO /interview] Chat message received for session ${sessionId}`)
            } catch (error) {
                console.error('[Socket.IO] Failed to save chat message:', error)
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
