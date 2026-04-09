import { useEffect } from 'react'
import { useSecureSocket } from '@/hooks/useSecureSocket'

export function useInterviewSocket({ sessionId }) {
    const { socket, isConnected } = useSecureSocket('/interview', {
        scope: 'interview',
        sessionId,
        autoReconnect: true,
    })

    // Join interview room when connected
    useEffect(() => {
        if (!socket || !isConnected) return

        socket.emit('interview:join')
    }, [socket, isConnected])

    return { socket, connectionStatus: isConnected ? 'connected' : 'connecting' }
}
