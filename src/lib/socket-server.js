import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { redisClient } from '@/lib/redis'
import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'

let io
let initPromise = null

export async function initSocketServer() {
    // If already initialized, return cached instance
    if (global._io) {
        console.log('[Socket.IO] Returning cached Socket.IO instance')
        return global._io
    }

    // If initialization is in progress, wait for it
    if (initPromise) {
        console.log('[Socket.IO] Initialization in progress, waiting...')
        return await initPromise
    }

    // Start initialization
    initPromise = (async () => {
        try {
            const port = 3002
            const serverIo = new Server(port, {
                cors: {
                    origin: '*',
                    methods: ['GET', 'POST'],
                },
            })

            // Setup Redis Adapter for multi-node scaling
            const pubClient = redisClient.duplicate()
            const subClient = redisClient.duplicate()
            await Promise.all([pubClient.connect(), subClient.connect()])
            serverIo.adapter(createAdapter(pubClient, subClient))

            global._io = serverIo
            console.log(`[Socket.IO] Real-time server started on port ${port}`)

            // Ensure submission worker is running in the same long-lived process.
            if (!global._submissionWorker) {
                try {
                    const { initSubmissionWorker } = await import('@/services/submission.worker')
                    global._submissionWorker = initSubmissionWorker()
                    console.log('[Socket.IO] Submission worker initialized from socket server')
                } catch (workerErr) {
                    console.error('[Socket.IO] Failed to initialize submission worker:', workerErr)
                }
            }

            // Register Namespaces
            const { registerInterviewNamespace } = await import('@/socket/namespaces/interview')
            registerInterviewNamespace(serverIo)

            // Handle client connections
            serverIo.on('connection', (socket) => {
                console.log(`[Socket.IO] Client connected: ${socket.id}`)
                console.log(`[Socket.IO] Total connected clients:`, serverIo.engine.clientsCount)

                socket.on('join_room', (roomId) => {
                    if (roomId) {
                        socket.join(roomId)
                        const roomClients = serverIo.sockets.adapter.rooms.get(roomId)
                        console.log(`[Socket.IO] Client ${socket.id} joined room: ${roomId}`, {
                            clientsInRoom: roomClients ? roomClients.size : 0,
                            allRoomsForClient: Array.from(socket.rooms),
                        })
                    } else {
                        console.warn(`[Socket.IO] Client ${socket.id} tried to join empty roomId`)
                    }
                })

                socket.on('leave_room', (roomId) => {
                    if (roomId) {
                        socket.leave(roomId)
                        const roomClients = serverIo.sockets.adapter.rooms.get(roomId)
                        console.log(`[Socket.IO] Client ${socket.id} left room: ${roomId}`, {
                            clientsInRoom: roomClients ? roomClients.size : 0,
                        })
                    }
                })

                socket.on('disconnect', (reason) => {
                    console.log(`[Socket.IO] Client ${socket.id} disconnected: ${reason}`)
                    console.log(
                        `[Socket.IO] Total connected clients after disconnect:`,
                        serverIo.engine.clientsCount
                    )
                })

                socket.on('error', (error) => {
                    console.error(`[Socket.IO] Socket error from ${socket.id}:`, error)
                })
            })

            // Redis Subscriber for submission events
            try {
                const redisSubClient = redisClient.duplicate()
                await redisSubClient.connect()

                await redisSubClient.subscribe('submission_updates', (message) => {
                    try {
                        const data = JSON.parse(message)
                        console.log(`[Socket.IO] Received message from Redis:`, {
                            type: data.type,
                            submissionId: data.submissionId,
                            userId: data.userId,
                        })

                        if (data.userId) {
                            const userId = data.userId.toString()

                            // Route specific event types to submission room
                            if (data.submissionId) {
                                const submissionRoom = `submission_${data.submissionId}`
                                const roomRoutedEvents = new Set([
                                    'submission_status',
                                    'judging_started',
                                    'test_case_result_batched',
                                    'test_case_result',
                                    'test_case_completed',
                                    'test_case_failed',
                                    'execution_completed',
                                    'final_verdict',
                                ])

                                if (roomRoutedEvents.has(data.type)) {
                                    console.log(
                                        `[Socket.IO] Broadcasting ${data.type} to room ${submissionRoom}`,
                                        {
                                            verdict: data.verdict ?? 'PENDING',
                                            stage: data.stage ?? 'queued',
                                            progress: data.progress ?? 0,
                                        }
                                    )

                                    const clientsInRoom =
                                        serverIo.sockets.adapter.rooms.get(submissionRoom)
                                    const clientCount = clientsInRoom ? clientsInRoom.size : 0
                                    console.log(
                                        `[Socket.IO] Room ${submissionRoom} has ${clientCount} connected clients`
                                    )

                                    if (data.type === 'test_case_result_batched') {
                                        // Unpack batched event into two separate events for the client
                                        serverIo.to(submissionRoom).emit('test_case_result', data)
                                        serverIo.to(userId).emit('test_case_result', data)

                                        serverIo
                                            .to(submissionRoom)
                                            .emit('test_case_completed', data)
                                        serverIo.to(userId).emit('test_case_completed', data)
                                    } else {
                                        serverIo.to(submissionRoom).emit(data.type, data)
                                        serverIo.to(userId).emit(data.type, data)
                                    }

                                    if (data.type === 'final_verdict' && data.closeRoom) {
                                        serverIo
                                            .to(submissionRoom)
                                            .emit('submission_room_close', data)
                                    }
                                }
                            }

                            // Route contest-specific events with their proper event names
                            if (data.type === 'contest:result_finalized') {
                                console.log(
                                    `[Socket.IO] Emitting contest:result_finalized to user ${userId}`
                                )
                                serverIo.to(userId).emit('contest:result_finalized', data)
                            }

                            if (data.type === 'leaderboard_update' && data.contestId) {
                                console.log(
                                    `[Socket.IO] Emitting leaderboard_update to user ${userId}`
                                )
                                serverIo.to(userId).emit('leaderboard_update', data)
                            }

                            // Also emit the generic submission_update for other listeners
                            console.log(`[Socket.IO] Emitting submission_update to user ${userId}`)
                            serverIo.to(userId).emit('submission_update', data)
                        }
                    } catch (e) {
                        console.error('[Socket.IO] Failed to parse Redis message', e)
                    }
                })

                await redisSubClient.subscribe('reaction_updates', (message) => {
                    try {
                        const data = JSON.parse(message)
                        if (data.problemId) {
                            // Emit only to users looking at this specific problem
                            serverIo.to(`problem:${data.problemId}`).emit('reaction_update', data)
                        }
                    } catch (e) {
                        console.error('[Socket.IO] Failed to parse reaction update', e)
                    }
                })

                // Subscribe to general notifications
                await redisSubClient.subscribe('notifications', (message) => {
                    try {
                        const data = JSON.parse(message)
                        if (data.recipientId) {
                            // Emit the notification to the specific user's room
                            serverIo
                                .to(data.recipientId.toString())
                                .emit('notification_received', data.notification)
                        }
                    } catch (e) {
                        console.error('[Socket.IO] Failed to parse notification Redis message', e)
                    }
                })

                // Subscribe to contest updates (schedule changes, etc.)
                await redisSubClient.subscribe('contest_updates', (message) => {
                    try {
                        const data = JSON.parse(message)
                        if (data.contestId) {
                            const contestRoom = `contest_${data.contestId}`
                            console.log(
                                `[Socket.IO] Broadcasting ${data.type} to room ${contestRoom}`
                            )
                            serverIo.to(contestRoom).emit('contest:updated', data)
                        }
                    } catch (e) {
                        console.error('[Socket.IO] Failed to parse contest update', e)
                    }
                })
            } catch (e) {
                console.error('[Socket.IO] Failed to connect Redis subscriber', e)
            }

            // Leaderboard Change Stream
            dbConnect()
                .then(() => {
                    const userChangeStream = User.watch([], { fullDocument: 'updateLookup' })
                    userChangeStream.on('change', (change) => {
                        if (
                            change.operationType === 'update' ||
                            change.operationType === 'replace'
                        ) {
                            const statsChanged =
                                change.updateDescription?.updatedFields?.stats ||
                                change.updateDescription?.updatedFields?.['stats.score']

                            if (statsChanged) {
                                serverIo.emit('rank_update', {
                                    type: 'score_changed',
                                    userId: change.documentKey._id,
                                    timestamp: new Date(),
                                })
                            }
                        }
                    })
                })
                .catch((e) => console.error(e))

            io = global._io
            return io
        } catch (error) {
            console.error('[Socket.IO] Critical error during initialization:', error.message)
            throw error
        }
    })()

    return await initPromise
}

export function getSocketIO() {
    return global._io
}
