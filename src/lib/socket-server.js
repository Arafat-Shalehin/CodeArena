import { Server } from 'socket.io'
import { redisClient } from '@/lib/redis'
import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'

let io

export async function initSocketServer() {
    if (global._io) return global._io

    const port = 3002
    global._io = new Server(port, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    })

    const serverIo = global._io
    console.log(`[Socket.IO] Real-time server started on port ${port}`)

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
        const subClient = redisClient.duplicate()
        await subClient.connect()

        await subClient.subscribe('submission_updates', (message) => {
            try {
                const data = JSON.parse(message)
                if (data.userId) {
                    serverIo.to(data.userId.toString()).emit('submission_update', data)
                }
            } catch (e) {
                console.error('[Socket.IO] Failed to parse Redis message', e)
            }
        })

        await subClient.subscribe('reaction_updates', (message) => {
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

        // NEW: Subscribe to general notifications
        await subClient.subscribe('notifications', (message) => {
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
                if (change.operationType === 'update' || change.operationType === 'replace') {
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
}
