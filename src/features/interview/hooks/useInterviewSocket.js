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
                reconnectionDelayMax: 5000,
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

        // Use the connection manager to track retry cycles natively
        newSocket.io.on('reconnect_attempt', () => {
            setConnectionStatus('reconnecting')
        })

        newSocket.io.on('reconnect_failed', () => {
            setConnectionStatus('failed')
        })

        // Do not permanently kill the UI on transient connection errors
        // newSocket.on('connect_error') intentionally ignored here to let the retry loop work

        return () => {
            newSocket.disconnect()
        }
    }, [wsToken, sessionId])

    return { socket, connectionStatus }
}
