import { useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'

/**
 * Hook to listen for real-time submission updates via Socket.IO
 * @param {string} submissionId - The submission ID to listen for
 * @param {function} onTestCaseCompleted - Callback when a test case completes
 * @param {function} onExecutionCompleted - Callback when execution completes
 * @returns {object} Socket instance and connection state
 */
export function useSubmissionRealtimeUpdates(
    submissionId,
    onTestCaseCompleted,
    onExecutionCompleted
) {
    const socket = useCallback(() => {
        // Connect to Socket.IO server
        return io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002', {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        })
    }, [])

    useEffect(() => {
        if (!submissionId) return

        const socketInstance = socket()

        socketInstance.on('connect', () => {
            console.log('[Socket] Connected, joining submission room:', submissionId)
            // Join the submission-specific room for this user
            socketInstance.emit('join_room', `submission_${submissionId}`)
        })

        // Listen for test case completion
        socketInstance.on('test_case_completed', (data) => {
            console.log('[Socket] Test case completed:', data)
            onTestCaseCompleted?.(data)
        })

        // Listen for execution completion (for 'run' type)
        socketInstance.on('execution_completed', (data) => {
            console.log('[Socket] Execution completed:', data)
            onExecutionCompleted?.(data)
        })

        socketInstance.on('error', (error) => {
            console.error('[Socket] Error:', error)
        })

        socketInstance.on('disconnect', () => {
            console.log('[Socket] Disconnected')
        })

        return () => {
            socketInstance.disconnect()
        }
    }, [submissionId, onTestCaseCompleted, onExecutionCompleted, socket])

    return { socket }
}
