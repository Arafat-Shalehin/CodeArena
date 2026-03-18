import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

export function useInterviewSocket({ wsToken, sessionId }) {
    const [socket, setSocket] = useState(null)
    const [connectionStatus, setConnectionStatus] = useState('connecting')
    const socketRef = useRef(null)

    useEffect(() => {
        if (!wsToken || !sessionId) return

        const newSocket = io(
            `${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002'}/interview`,
            {
                auth: { token: wsToken },
                reconnectionAttempts: 3,
            }
        )

        socketRef.current = newSocket
        setSocket(newSocket)

        newSocket.on('connect', () => {
            setConnectionStatus('connected')
            newSocket.emit('interview:join')
        })

        newSocket.on('disconnect', (reason) => {
            if (reason === 'io server disconnect') {
                newSocket.connect()
            }
            setConnectionStatus('disconnected')
        })

        newSocket.on('connect_error', () => {
            setConnectionStatus('failed')
        })

        return () => {
            newSocket.disconnect()
        }
    }, [wsToken, sessionId])

    return { socket, connectionStatus }
}
