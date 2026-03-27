import { useEffect, useRef } from 'react'

export function useAutoSnapshot({ socket, sessionId, problemId, language, code, currentPhase }) {
    const lastSavedCodeRef = useRef(code)

    useEffect(() => {
        if (!socket || !problemId || currentPhase !== 'coding') return

        const id = setInterval(() => {
            if (code !== lastSavedCodeRef.current) {
                socket.emit('interview:code_snapshot', {
                    sessionId,
                    problemId,
                    language,
                    code,
                    snapshotType: 'auto',
                })
                lastSavedCodeRef.current = code
            }
        }, 30000)

        return () => clearInterval(id)
    }, [socket, sessionId, problemId, language, code, currentPhase])
}
