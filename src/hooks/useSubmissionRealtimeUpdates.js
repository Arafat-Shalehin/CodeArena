import { useEffect } from 'react'
import { useSecureSocket } from './useSecureSocket'

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
    const { socket, isConnected } = useSecureSocket('/', { scope: 'submission' })

    useEffect(() => {
        if (!submissionId || !isConnected || !socket) return

        console.log('[Socket] Connected, joining submission room:', submissionId)
        // Join the submission-specific room for this user
        socket.emit('join_room', `submission_${submissionId}`)

        // Listen for test case completion
        socket.on('test_case_completed', (data) => {
            console.log('[Socket] Test case completed:', data)
            onTestCaseCompleted?.(data)
        })

        // Listen for execution completion (for 'run' type)
        socket.on('execution_completed', (data) => {
            console.log('[Socket] Execution completed:', data)
            onExecutionCompleted?.(data)
        })

        socket.on('error', (error) => {
            console.error('[Socket] Error:', error)
        })

        // Socket auto-reconnection and cleanup is handled by useSecureSocket hook
        // No need to manually disconnect here
    }, [submissionId, isConnected, socket, onTestCaseCompleted, onExecutionCompleted])

    return { socket, isConnected }
}
