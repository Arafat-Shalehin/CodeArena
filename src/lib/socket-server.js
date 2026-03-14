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

            // Register Namespaces
            const { registerInterviewNamespace } = await import('@/socket/namespaces/interview')
            registerInterviewNamespace(serverIo)

            // Handle client connections
            serverIo.on('connection', (socket) => {
                socket.on('join_room', (roomId) => {
                    if (roomId) {
                        socket.join(roomId)
                    }
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
                            if (
                                data.type === 'test_case_completed' ||
                                data.type === 'execution_completed'
                            ) {
                                // Send to the submission room
                                console.log(
                                    `[Socket.IO] Broadcasting ${data.type} to room submission_${data.submissionId}`
                                )
                                serverIo.to(`submission_${data.submissionId}`).emit(data.type, data)
                                console.log(`[Socket.IO] Broadcast complete for ${data.type}`)
                            }

                            // Also emit the generic submission_update for other listeners
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
