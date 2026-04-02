'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useInterviewSocket } from '../hooks/useInterviewSocket'
import { useAutoSnapshot } from '../hooks/useAutoSnapshot'

const InterviewContext = createContext(null)

export function InterviewProvider({
    children,
    sessionId,
    initialProblem,
    initialWsToken,
    initialDurationMins,
    initialStartedAt,
    initialMessages = [],
    onEnd,
}) {
    const router = useRouter()

    // ── Session Context state (Rehydratable) ──────────────────────────────────
    const [problemState, setProblemState] = useState(initialProblem)
    const [wsTokenState, setWsTokenState] = useState(initialWsToken)
    const [durationState, setDurationState] = useState(initialDurationMins)
    const [startedAtState, setStartedAtState] = useState(initialStartedAt)
    const [messages, setMessages] = useState(() => {
        // If it's a fresh session with only the AI intro, mark it as streaming:true
        // so that the incoming socket 'sim-stream' chunks attach to this message
        // instead of creating a duplicate.
        if (
            initialMessages?.length === 1 &&
            initialMessages[0].role === 'ai' &&
            initialMessages[0].phase === 'intro'
        ) {
            return [{ ...initialMessages[0], streaming: true }]
        }
        return initialMessages
    })
    const [code, setCode] = useState(initialProblem?.starterCode?.['python'] || '')
    const [language, setLanguage] = useState('python')
    const [sessionStatus, setSessionStatus] = useState('active')
    const [currentPhase, setCurrentPhase] = useState('intro')

    // ── Local UI state ────────────────────────────────────────────────────────
    const lastSequenceMap = useRef({})
    const [isAiTyping, setIsAiTyping] = useState(false)
    const [isRunning, setIsRunning] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isRehydrating, setIsRehydrating] = useState(true)
    const [showExitConfirm, setShowExitConfirm] = useState(false)
    const [isTerminating, setIsTerminating] = useState(false)
    const [error, setError] = useState(null)

    // ── Socket & Snapshot Hooks ───────────────────────────────────────────────
    const { socket, connectionStatus } = useInterviewSocket({
        wsToken: wsTokenState,
        sessionId,
    })

    useAutoSnapshot({
        socket,
        sessionId,
        problemId: problemState?._id,
        language,
        code,
        currentPhase,
    })

    // ── 1) Rehydrate session data on mount ────────────────────────────────────
    useEffect(() => {
        let mounted = true
        const rehydrate = async () => {
            try {
                const res = await fetch(`/api/interview/sessions/${sessionId}/rehydrate`)
                const json = await res.json()
                if (mounted && json.success && json.data) {
                    if (json.data.problem) setProblemState(json.data.problem)
                    if (json.data.wsToken) setWsTokenState(json.data.wsToken)
                    if (json.data.durationMins) setDurationState(json.data.durationMins)
                    if (json.data.startedAt) setStartedAtState(json.data.startedAt)
                    if (json.data.messages?.length > 0) setMessages(json.data.messages)
                    if (json.data.latestCode) setCode(json.data.latestCode)
                    if (json.data.codeLanguage) setLanguage(json.data.codeLanguage)
                    if (json.data.status) setSessionStatus(json.data.status)
                    if (json.data.currentPhase) setCurrentPhase(json.data.currentPhase)

                    if (json.data.currentStreamingMessage) {
                        const sm = json.data.currentStreamingMessage
                        if (sm.messageId) lastSequenceMap.current[sm.messageId] = sm.sequence

                        setMessages((prev) => {
                            // Only append if it doesn't exist
                            const exists = prev.some(
                                (m) => m.messageId === sm.messageId || m.content === sm.content
                            )
                            if (exists) return prev
                            return [
                                ...prev,
                                {
                                    role: 'ai',
                                    content: sm.content,
                                    streaming: true,
                                    messageId: sm.messageId,
                                },
                            ]
                        })
                        setIsAiTyping(true)
                    }
                }
            } catch (err) {
                console.error('[Interview] Rehydration failed:', err)
                if (mounted) setError(err)
            } finally {
                if (mounted) setIsRehydrating(false)
            }
        }
        rehydrate()
        return () => {
            mounted = false
        }
    }, [sessionId])

    // ── 2) Attach domain socket events ─────────────────────────────────────────
    useEffect(() => {
        if (!socket || isRehydrating) return

        // Hardened AI streaming handler with messageId + sequence idempotency
        const handleAiStream = ({ chunk, done, messageId, sequence, error: streamError }) => {
            // Idempotency: skip duplicate sequences
            if (messageId && sequence) {
                if (!lastSequenceMap.current[messageId]) {
                    lastSequenceMap.current[messageId] = 0
                }
                if (sequence <= lastSequenceMap.current[messageId]) return
                lastSequenceMap.current[messageId] = sequence
            }

            if (!done) {
                setIsAiTyping(true)
                setMessages((prev) => {
                    const last = prev[prev.length - 1]

                    // 1. Append to existing streaming AI message
                    if (last && last.role === 'ai' && last.streaming) {
                        if (messageId && last.messageId && last.messageId !== messageId) {
                            return [
                                ...prev,
                                { role: 'ai', content: chunk, streaming: true, messageId },
                            ]
                        }
                        if (last.content === chunk) return prev
                        return [...prev.slice(0, -1), { ...last, content: last.content + chunk }]
                    }

                    // 2. Specialized Check: static AI intro -> upgrade to streaming
                    if (
                        last &&
                        last.role === 'ai' &&
                        !last.streaming &&
                        last.phase === 'intro' &&
                        (last.content === chunk || chunk.startsWith(last.content))
                    ) {
                        return [...prev.slice(0, -1), { ...last, streaming: true }]
                    }

                    // 3. Fallback: create new streaming message
                    const isErr = chunk.includes('Sorry, I')
                    return [
                        ...prev,
                        { role: 'ai', content: chunk, streaming: true, isError: isErr, messageId },
                    ]
                })
            } else {
                setIsAiTyping(false)
                lastProcessedSequence = 0

                // Handle streaming error payload
                if (streamError) {
                    setMessages((prev) => {
                        const last = prev[prev.length - 1]
                        if (last?.streaming) {
                            const finalContent = last.content || streamError
                            return [
                                ...prev.slice(0, -1),
                                { ...last, content: finalContent, streaming: false, isError: true },
                            ]
                        }
                        return [...prev, { role: 'ai', content: streamError, isError: true }]
                    })
                    return
                }

                setMessages((prev) => {
                    const last = prev[prev.length - 1]
                    if (last?.streaming) {
                        if (!last.content) {
                            return [
                                ...prev.slice(0, -1),
                                {
                                    ...last,
                                    content: 'Something went wrong. Please retry.',
                                    streaming: false,
                                    isError: true,
                                },
                            ]
                        }
                        return [...prev.slice(0, -1), { ...last, streaming: false }]
                    }
                    return prev
                })
            }
        }

        const handlePhaseChange = (newPhase) => {
            setCurrentPhase(newPhase)
            toast.custom(
                () => (
                    <div className="border-border bg-bg-subtle text-text-primary rounded-xl border p-4 shadow-xl">
                        <h4 className="font-bold tracking-tight text-purple-400 uppercase">
                            Phase Changed
                        </h4>
                        <p className="mt-1 text-sm">
                            The interview has moved to{' '}
                            <strong className="underline decoration-purple-500/50 decoration-2 underline-offset-2">
                                {newPhase.replace('_', ' ')}
                            </strong>
                            .
                        </p>
                    </div>
                ),
                { duration: 4000 }
            )
        }

        const handleRunResult = (result) => {
            setIsRunning(false)
            if (result.success) {
                // ... handle console logs if needed
            } else {
                toast.error(result.error || 'Execution failed')
            }
        }

        const handleSubmissionResult = (result) => {
            setIsSubmitting(false)
            if (result.success) {
                toast.success('Submission accepted! AI is analyzing your code.')
            } else {
                toast.error(result.error || 'Submission failed test cases')
            }
        }

        const handleScorecard = (scorecard) => {
            setSessionStatus('completed')
            toast.success('Scorecard generated! Redirecting...')
            router.push(`/interview/${sessionId}/result`)
        }

        const handleInterviewError = (errorRaw) => {
            const errObj = typeof errorRaw === 'string' ? { message: errorRaw } : errorRaw

            if (errObj.code === 'SESSION_ENDED') {
                setSessionStatus('completed')
                toast.error(errObj.message)
                setTimeout(() => {
                    router.push(`/interview/${sessionId}/result`)
                }, 2000)
                return
            }

            setError(errObj)
            setIsRunning(false)
            setIsSubmitting(false)
        }

        const handleInterviewEnded = ({ status } = {}) => {
            if (status) setSessionStatus(status)
            toast.info('Session ended by server')
            onEnd?.()
        }

        const handlePing = ({ ts }) => {
            socket.emit('interview:pong', { ts })
        }

        const handleConnect = async () => {
            try {
                // Seamlessly resynchronise messages and basic state without blocking UI
                const res = await fetch(`/api/interview/sessions/${sessionId}/rehydrate`)
                const json = await res.json()
                if (json.success && json.data) {
                    if (json.data.messages) setMessages(json.data.messages)
                    if (json.data.currentPhase) {
                        if (json.data.currentPhase !== currentPhase) {
                            handlePhaseChange(json.data.currentPhase)
                        } else {
                            setCurrentPhase(json.data.currentPhase)
                        }
                    }
                    if (json.data.status) setSessionStatus(json.data.status)
                }
            } catch (err) {
                console.warn('[Interview] Background socket rehydration failed:', err)
            }
        }

        socket.on('interview:ping', handlePing)
        socket.on('connect', handleConnect)
        socket.on('interview:ai_stream_chunk', handleAiStream)
        socket.on('interview:phase_change', handlePhaseChange)
        socket.on('interview:run_result', handleRunResult)
        socket.on('interview:submission_result', handleSubmissionResult)
        socket.on('interview:scorecard', handleScorecard)
        socket.on('interview:error', handleInterviewError)
        socket.on('interview:ended', handleInterviewEnded)

        return () => {
            socket.off('interview:ping', handlePing)
            socket.off('connect', handleConnect)
            socket.off('interview:ai_stream_chunk', handleAiStream)
            socket.off('interview:phase_change', handlePhaseChange)
            socket.off('interview:run_result', handleRunResult)
            socket.off('interview:submission_result', handleSubmissionResult)
            socket.off('interview:scorecard', handleScorecard)
            socket.off('interview:error', handleInterviewError)
            socket.off('interview:ended', handleInterviewEnded)
            setIsAiTyping(false) // safety
        }
    }, [socket, isRehydrating, sessionId, router, onEnd])

    // ── Hard timeout for stuck AI streaming ──────────────────────────────────
    const MAX_STREAM_TIME = 30_000
    useEffect(() => {
        if (!isAiTyping) return
        const timer = setTimeout(() => {
            console.warn('[InterviewContext] AI stream timeout — forcing reset')
            setIsAiTyping(false)
            setMessages((prev) => {
                const last = prev[prev.length - 1]
                if (last?.streaming) {
                    return [
                        ...prev.slice(0, -1),
                        {
                            ...last,
                            content: last.content || 'AI response timed out. Please try again.',
                            streaming: false,
                            isError: !last.content,
                        },
                    ]
                }
                return prev
            })
            toast.error('AI response timed out. Please try sending your message again.')
        }, MAX_STREAM_TIME)
        return () => clearTimeout(timer)
    }, [isAiTyping])

    // ── 3) Handlers ───────────────────────────────────────────────────────────
    const handleSendMessage = useCallback(
        (content) => {
            if (!socket || sessionStatus !== 'active') return
            if (isAiTyping) {
                toast.error('Please wait for the AI to finish responding.')
                return
            }
            setMessages((prev) => [...prev, { role: 'user', content, phase: currentPhase }])
            setIsAiTyping(true)
            socket.emit('interview:chat_message', { content, phase: currentPhase })
        },
        [socket, sessionStatus, currentPhase, isAiTyping]
    )

    const handleRun = useCallback(() => {
        if (!socket || sessionStatus !== 'active') return
        setIsRunning(true)
        socket.emit('interview:run', { code, language, problemId: problemState?._id })
        socket.emit('interview:code_snapshot', {
            sessionId,
            problemId: problemState?._id,
            language,
            code,
            snapshotType: 'run',
        })
    }, [socket, sessionStatus, code, language, problemState, sessionId])

    const handleSubmit = useCallback(() => {
        if (!socket || sessionStatus !== 'active') return
        setIsSubmitting(true)
        socket.emit('interview:submit', { code, language, problemId: problemState?._id })
        socket.emit('interview:code_snapshot', {
            sessionId,
            problemId: problemState?._id,
            language,
            code,
            snapshotType: 'submit',
        })
    }, [socket, sessionStatus, code, language, problemState, sessionId])

    const handleTerminateSession = useCallback(async () => {
        if (isTerminating) return
        setIsTerminating(true)
        try {
            const res = await fetch(`/api/interview/sessions/${sessionId}/end`, { method: 'POST' })
            const json = await res.json()
            if (json.success) {
                setSessionStatus('completed')
                setShowExitConfirm(false)
                toast.success('Session ended. Generating scorecard...')
                if (socket) {
                    socket.disconnect()
                }
                router.push(`/interview/${sessionId}/result`)
            } else {
                throw new Error(json.message || 'Failed to end session')
            }
        } catch (err) {
            console.error('Terminate Error:', err)
            toast.error(err.message)
            setIsTerminating(false)
        }
    }, [isTerminating, sessionId, socket, router])

    const handleRetryNetwork = useCallback(() => {
        if (socket) {
            socket.connect()
        }
        setError(null)
    }, [socket])

    const handleExitPanic = useCallback(() => {
        router.push('/feed')
    }, [router])

    return (
        <InterviewContext.Provider
            value={{
                sessionId,
                wsToken: wsTokenState,
                problem: problemState,
                messages,
                code,
                setCode,
                language,
                setLanguage,
                sessionStatus,
                currentPhase,
                isAiTyping,
                isRunning,
                isSubmitting,
                isRehydrating,
                showExitConfirm,
                setShowExitConfirm,
                isTerminating,
                error,
                connectionStatus,
                durationState,
                startedAtState,
                handleSendMessage,
                handleRun,
                handleSubmit,
                handleTerminateSession,
                handleRetryNetwork,
                handleExitPanic,
                onEnd,
            }}
        >
            {children}
        </InterviewContext.Provider>
    )
}

export const useInterview = () => {
    const context = useContext(InterviewContext)
    if (!context) throw new Error('useInterview must be used within InterviewProvider')
    return context
}
