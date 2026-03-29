import { useEffect, useRef } from 'react'

export function useAutoSnapshot({ socket, sessionId, problemId, language, code, currentPhase }) {
    const lastSavedCodeRef = useRef(code)
    const latestCodeRef = useRef(code)
    const latestProblemIdRef = useRef(problemId)
    const latestLanguageRef = useRef(language)
    const latestPhaseRef = useRef(currentPhase)
    const lastEmitAtRef = useRef(0)

    useEffect(() => {
        latestCodeRef.current = code
        latestProblemIdRef.current = problemId
        latestLanguageRef.current = language
        latestPhaseRef.current = currentPhase
    }, [code, problemId, language, currentPhase])

    useEffect(() => {
        if (!socket || !sessionId) return

        const id = setInterval(() => {
            const latestCode = latestCodeRef.current
            const latestProblemId = latestProblemIdRef.current
            const latestLanguage = latestLanguageRef.current
            const latestPhase = latestPhaseRef.current

            if (!latestProblemId || latestPhase !== 'coding') return
            if (latestCode === lastSavedCodeRef.current) return

            const now = Date.now()
            if (now - lastEmitAtRef.current < 20_000) {
                return
            }

            socket.emit('interview:code_snapshot', {
                sessionId,
                problemId: latestProblemId,
                language: latestLanguage,
                code: latestCode,
                snapshotType: 'auto',
            })
            lastSavedCodeRef.current = latestCode
            lastEmitAtRef.current = now
        }, 30000)

        return () => clearInterval(id)
    }, [socket, sessionId])
}
