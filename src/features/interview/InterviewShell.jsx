'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import {
    Loader2,
    Clock,
    Tag,
    Star,
    GripVertical,
    AlertCircle,
    WifiOff,
    RefreshCw,
    LogOut,
    AlertTriangle,
    Target,
    Sparkles,
    Trophy,
    MessageSquare,
    Code,
    Bot,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import AreanaLogo from '@/shared/components/ui/AreanaLogo'
import { useAuth } from '@/context/AuthContext'
import EditorPanel from './EditorPanel'
import AiChatPanel from './components/chat/AiChatPanel'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DIFFICULTY_STYLES = {
    easy: 'text-[#00b8a3] bg-[#00b8a3]/10',
    medium: 'text-[#ffc01e] bg-[#ffc01e]/10',
    hard: 'text-[#ff375f] bg-[#ff375f]/10',
}

function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0')
    const s = String(seconds % 60).padStart(2, '0')
    return `${m}:${s}`
}

// ─── ProblemPanel ─────────────────────────────────────────────────────────────

function ProblemPanel({ problem }) {
    if (!problem) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 size={24} className="text-accent animate-spin" />
            </div>
        )
    }

    return (
        <div className="h-full overflow-y-auto p-5 text-sm">
            {/* Title + difficulty */}
            <h2 className="text-text-primary mb-2 text-xl font-bold">{problem.title}</h2>
            <div className="mb-4 flex flex-wrap gap-2">
                <span
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                        DIFFICULTY_STYLES[problem.difficulty] || ''
                    }`}
                >
                    {problem.difficulty}
                </span>
                {problem.tags?.map((tag) => (
                    <span
                        key={tag}
                        className="bg-bg-muted text-text-secondary flex items-center gap-1 rounded-full px-3 py-1 text-[11px]"
                    >
                        <Tag size={11} />
                        {tag}
                    </span>
                ))}
            </div>

            {/* Limits */}
            <div className="border-border bg-bg-page/50 text-text-secondary mb-5 flex items-center gap-5 rounded-xl border p-3 text-[12px]">
                <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-accent" />
                    {problem.timeLimit}ms
                </span>
                <span className="flex items-center gap-1.5">
                    <Star size={13} className="text-accent" />
                    {Math.round((problem.memoryLimit || 0) / 1024)}MB
                </span>
            </div>

            {/* Description */}
            <div className="text-text-secondary prose-markdown mb-6 leading-relaxed">
                {problem.description}
            </div>

            {/* Sample test cases */}
            {problem.sampleTestCases?.length > 0 && (
                <div className="space-y-5">
                    {problem.sampleTestCases.map((tc, i) => (
                        <div key={i}>
                            <h4 className="text-text-primary mb-2 text-[13px] font-bold">
                                Example {i + 1}:
                            </h4>
                            <div className="border-border overflow-hidden rounded-xl border font-mono text-[12px]">
                                <div className="bg-bg-muted text-text-muted border-border border-b px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase">
                                    Input
                                </div>
                                <div className="text-text-primary p-4 whitespace-pre-wrap">
                                    {tc.input}
                                </div>
                                <div className="bg-bg-muted text-text-muted border-border border-y px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase">
                                    Output
                                </div>
                                <div className="text-text-primary p-4 whitespace-pre-wrap">
                                    {tc.output}
                                </div>
                                {tc.explanation && (
                                    <>
                                        <div className="bg-bg-muted text-text-muted border-border border-y px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase">
                                            Explanation
                                        </div>
                                        <div className="text-text-secondary p-4 whitespace-pre-wrap italic">
                                            {tc.explanation}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── (Removed inline AiChatPanel — now imported from components/chat/AiChatPanel) ───

// ─── Error Components ────────────────────────────────────────────────────────

function ConnectionBanner({ status }) {
    if (status === 'connected') return null

    const config = {
        disconnected: {
            icon: <WifiOff size={14} />,
            text: 'Disconnected from server. Attempting to reconnect...',
            bg: 'bg-red-500/10 text-red-500',
        },
        reconnecting: {
            icon: <RefreshCw size={14} className="animate-spin" />,
            text: 'Reconnecting to interview session...',
            bg: 'bg-yellow-500/10 text-yellow-500',
        },
        failed: {
            icon: <AlertCircle size={14} />,
            text: 'Connection failed. Please check your network.',
            bg: 'bg-red-600 text-white',
        },
    }

    const { icon, text, bg } = config[status] || config.disconnected

    return (
        <div
            className={`flex items-center justify-center gap-2 px-4 py-1.5 text-[11px] font-bold tracking-tight transition-all duration-300 ${bg}`}
        >
            {icon}
            {text}
        </div>
    )
}

function ErrorOverlay({ error, onRetry, onExit }) {
    if (!error) return null

    return (
        <div className="bg-bg-page/95 animate-in fade-in absolute inset-0 z-100 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-500">
                <AlertTriangle size={36} />
            </div>
            <h2 className="text-text-primary mb-2 text-2xl font-bold">Something went wrong</h2>
            <p className="text-text-secondary mb-8 max-w-sm text-sm leading-relaxed">
                {error.message || 'An unexpected error occurred during your interview session.'}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
                <button
                    onClick={onRetry}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95"
                >
                    <RefreshCw size={16} />
                    Retry Operation
                </button>
                <button
                    onClick={onExit}
                    className="border-border text-text-primary flex items-center justify-center gap-2 rounded-xl border px-6 py-2.5 text-sm font-bold transition-transform hover:scale-105 hover:bg-white/5 active:scale-95"
                >
                    <LogOut size={16} />
                    Exit Session
                </button>
            </div>

            {error.type && (
                <span className="text-text-muted mt-12 font-mono text-[10px] uppercase opacity-50">
                    Error Code: {error.type}
                </span>
            )}
        </div>
    )
}

// ─── Phase Change Notification ───────────────────────────────────────────────

const PHASE_CONFIG = {
    intro: {
        title: 'Interview Started',
        subtitle: 'Setting the stage for your session',
        icon: <Bot size={24} />,
        color: 'text-[#00b8a3]',
        bg: 'bg-[#00b8a3]/10',
    },
    technical_questions: {
        title: 'Technical Deep Dive',
        subtitle: 'Explain your logic and approach',
        icon: <MessageSquare size={24} />,
        color: 'text-accent',
        bg: 'bg-accent/10',
    },
    coding: {
        title: 'Coding Phase',
        subtitle: 'Implement your solution in the editor',
        icon: <Code size={24} />,
        color: 'text-[#ffc01e]',
        bg: 'bg-[#ffc01e]/10',
    },
    evaluation: {
        title: 'Performance Review',
        subtitle: 'AI is analyzing your submission',
        icon: <Target size={24} />,
        color: 'text-purple-400',
        bg: 'bg-purple-400/10',
    },
    completed: {
        title: 'Interview Finalized',
        subtitle: 'Generating your detailed scorecard',
        icon: <Trophy size={24} />,
        color: 'text-green-500',
        bg: 'bg-green-500/10',
    },
}

function PhaseChangeOverlay({ phase, onDismiss }) {
    const config = PHASE_CONFIG[phase] || PHASE_CONFIG.intro

    useEffect(() => {
        const timer = setTimeout(onDismiss, 3500)
        return () => clearTimeout(timer)
    }, [onDismiss])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-200 flex items-center justify-center p-6 backdrop-blur-xl"
        >
            <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: -20 }}
                className="border-border bg-bg-page/40 flex max-w-md flex-col items-center rounded-[2.5rem] border p-12 text-center shadow-[0_0_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl"
            >
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`mb-6 flex h-20 w-20 items-center justify-center rounded-3xl ${config.bg} ${config.color} shadow-lg`}
                >
                    {config.icon}
                </motion.div>

                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-accent mb-2 text-[10px] font-black tracking-[0.3em] uppercase">
                        Mission Objective
                    </h2>
                    <h1 className="text-text-primary mb-3 text-4xl font-black tracking-tight italic">
                        {config.title}
                    </h1>
                    <p className="text-text-secondary text-sm leading-relaxed font-medium opacity-80">
                        {config.subtitle}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 2.8, ease: 'linear' }}
                    className="bg-accent/30 mt-10 h-1 w-32 origin-center overflow-hidden rounded-full"
                >
                    <motion.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        className="bg-accent h-full w-full"
                    />
                </motion.div>
            </motion.div>

            {/* Sparkles decoration */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                className="pointer-events-none absolute inset-0 overflow-hidden"
            >
                <Sparkles size={80} className="text-accent absolute top-20 left-20 animate-pulse" />
                <Sparkles
                    size={40}
                    className="text-accent absolute right-20 bottom-20 animate-pulse [animation-delay:1s]"
                />
            </motion.div>
        </motion.div>
    )
}

function InterviewTimer({ durationMins, startedAt, onTimeExpired }) {
    const totalSeconds = durationMins * 60
    const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
    const [remaining, setRemaining] = useState(Math.max(0, totalSeconds - elapsed))
    const hasFired = useRef(false)

    useEffect(() => {
        if (remaining <= 0) {
            if (!hasFired.current && onTimeExpired) {
                hasFired.current = true
                onTimeExpired()
            }
            return
        }
        const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
        return () => clearInterval(id)
    }, [remaining, onTimeExpired])

    const pct = remaining / totalSeconds
    const color = pct > 0.33 ? 'text-success' : pct > 0.15 ? 'text-[#ffc01e]' : 'text-error'

    return (
        <span className={`font-mono text-sm font-bold tabular-nums ${color}`}>
            <Clock size={14} className="mr-1 inline" />
            {formatTime(remaining)}
        </span>
    )
}

// ─── InterviewShell ───────────────────────────────────────────────────────────

/**
 * Props:
 *  sessionId   – string (MongoDB ObjectId from createSession)
 *  problem     – populated problem object
 *  wsToken     – short-lived JWT for Socket.IO auth
 *  durationMins – number
 *  startedAt   – ISO string
 *  onEnd       – () => void  (called when session ends / timer hits 0)
 */
export default function InterviewShell({
    sessionId,
    problem,
    wsToken,
    durationMins,
    startedAt,
    initialMessages = [],
    onEnd,
}) {
    const { user } = useAuth()

    // ── Session Context state (Rehydratable) ──────────────────────────────────
    const [problemState, setProblemState] = useState(problem)
    const [wsTokenState, setWsTokenState] = useState(wsToken)
    const [durationState, setDurationState] = useState(durationMins)
    const [startedAtState, setStartedAtState] = useState(startedAt)
    const [currentPhase, setCurrentPhase] = useState('intro')
    const [sessionStatus, setSessionStatus] = useState('active')

    // ── Code editor state ────────────────────────────────────────────────────
    const [code, setCode] = useState(problemState?.defaultCode?.python ?? '')
    const [language, setLanguage] = useState('python')
    const [isRunning, setIsRunning] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isRehydrating, setIsRehydrating] = useState(true)

    // ── Chat state ────────────────────────────────────────────────────────────
    const [messages, setMessages] = useState(initialMessages)
    const [isAiTyping, setIsAiTyping] = useState(false)

    // ── Error & Connection state ──────────────────────────────────────────────
    const [error, setError] = useState(null)
    const [connectionStatus, setConnectionStatus] = useState('connected') // connected, disconnected, reconnecting, failed
    const [showExitConfirm, setShowExitConfirm] = useState(false)
    const [isTerminating, setIsTerminating] = useState(false)
    const [activePhaseChange, setActivePhaseChange] = useState(null)

    // ── Layout: left-panel width ratio ───────────────────────────────────────
    const [leftPct, setLeftPct] = useState(30) // % for problem description
    const [rightPct, setRightPct] = useState(30) // % for AI chat
    const containerRef = useRef(null)
    const draggingLeft = useRef(false)
    const draggingRight = useRef(false)

    // ── Socket.IO connection ─────────────────────────────────────────────────
    const socketRef = useRef(null)

    // ── Rehydration ──────────────────────────────────────────────────────────
    useEffect(() => {
        const rehydrate = async () => {
            if (!sessionId) return
            try {
                const res = await fetch(`/api/interview/sessions/${sessionId}/rehydrate`)
                if (!res.ok) throw new Error(`Server responded with ${res.status}`)

                const json = await res.json()

                if (json.success) {
                    const {
                        messages: history,
                        latestCode,
                        language: lastLang,
                        problem: p,
                        wsToken: token,
                        durationMins: d,
                        startedAt: s,
                    } = json.data

                    if (history?.length > 0) setMessages(history)
                    if (latestCode) setCode(latestCode)
                    if (lastLang) setLanguage(lastLang)

                    // Set session context
                    setProblemState(p)
                    setWsTokenState(token)
                    setDurationState(json.data.durationMins || 60)
                    setStartedAtState(json.data.startedAt)
                    setCurrentPhase(json.data.currentPhase || 'intro')
                    setSessionStatus(json.data.status || 'active')

                    if (json.data.status && json.data.status !== 'active') {
                        // If session is already finished, redirect to results
                        window.location.href = `/interview/${sessionId}/result`
                        return
                    }

                    if (json.data.messages) {
                        setMessages(
                            json.data.messages.map((m) => ({
                                id: m.id,
                                role: m.role,
                                content: m.content,
                                phase: m.phase,
                                ts: m.ts,
                            }))
                        )
                    }
                } else {
                    throw new Error(json.error || 'Failed to restore session data')
                }
            } catch (err) {
                console.error('[InterviewShell] Rehydration failed:', err)
                setError({
                    type: 'REHYDRATION_ERROR',
                    message:
                        "We couldn't restore your session state. This might be due to a lost connection.",
                    fatal: true,
                })
            } finally {
                setIsRehydrating(false)
            }
        }

        rehydrate()
    }, [sessionId])

    useEffect(() => {
        if (!wsTokenState || !sessionId || isRehydrating) return

        const socket = io(
            `${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002'}/interview`,
            {
                auth: { token: wsTokenState },
                reconnectionAttempts: 3,
            }
        )
        socketRef.current = socket

        socket.on('connect', () => {
            setConnectionStatus('connected')
            socket.emit('interview:join')
            toast.success('Connected to interview session')
        })

        socket.on('disconnect', (reason) => {
            console.warn('[Socket] Disconnected:', reason)
            setIsAiTyping(false) // Force reset typing indicator if disconnected mid-stream
            if (reason === 'io server disconnect') {
                // transport-level disconnect
                setConnectionStatus('failed')
            } else {
                setConnectionStatus('disconnected')
            }
        })

        socket.on('connect_error', (err) => {
            console.error('[Socket] Connection Error:', err)
            setIsAiTyping(false) // Force reset typing indicator
            setConnectionStatus('reconnecting')
        })

        socket.on('reconnect_attempt', (attempt) => {
            console.log('[Socket] Reconnecting...', attempt)
            setConnectionStatus('reconnecting')
        })

        socket.on('reconnect_failed', () => {
            setConnectionStatus('failed')
            setError({
                type: 'CONNECTION_FAILED',
                message: 'Lost connection to the interview server. Please check your internet.',
                fatal: true,
            })
        })

        // ── Server-to-client events ──────────────────────────────────────────

        // AI streaming — hardened with messageId + sequence idempotency
        const lastSequenceRef = { current: 0 }
        const currentStreamingId = { current: null }

        socket.on(
            'interview:ai_stream_chunk',
            ({ chunk, done, messageId, sequence, error: streamError }) => {
                // Idempotency: skip if we've already processed this sequence for THIS message
                if (
                    sequence &&
                    messageId === currentStreamingId.current &&
                    sequence <= lastSequenceRef.current
                )
                    return

                if (messageId) currentStreamingId.current = messageId
                if (sequence) lastSequenceRef.current = sequence

                if (!done) {
                    setIsAiTyping(true)
                    setMessages((prev) => {
                        // 1. Try to find message by ID
                        const existingIdx = messageId
                            ? prev.findIndex((m) => m.id === messageId)
                            : -1

                        if (existingIdx !== -1) {
                            const newMsg = {
                                ...prev[existingIdx],
                                content: prev[existingIdx].content + chunk,
                                streaming: true,
                            }
                            const newArr = [...prev]
                            newArr[existingIdx] = newMsg
                            return newArr
                        }

                        // 2. Fallback: Update last AI message if it matches profile
                        const last = prev[prev.length - 1]
                        if (last && last.role === 'ai' && last.streaming) {
                            return [
                                ...prev.slice(0, -1),
                                { ...last, id: messageId, content: last.content + chunk },
                            ]
                        }

                        // 3. Last resort: Create new message
                        const isErr = chunk?.includes('Sorry, I')
                        return [
                            ...prev,
                            {
                                id: messageId,
                                role: 'ai',
                                content: chunk,
                                streaming: true,
                                isError: isErr,
                            },
                        ]
                    })
                } else {
                    setIsAiTyping(false)
                    lastSequenceRef.current = 0
                    currentStreamingId.current = null

                    // Handle "done without content" edge case
                    if (streamError) {
                        setMessages((prev) => {
                            const last = prev[prev.length - 1]
                            if (last?.streaming) {
                                const finalContent = last.content || streamError
                                return [
                                    ...prev.slice(0, -1),
                                    {
                                        ...last,
                                        content: finalContent,
                                        streaming: false,
                                        isError: true,
                                    },
                                ]
                            }
                            return [...prev, { role: 'ai', content: streamError, isError: true }]
                        })
                        return
                    }

                    setMessages((prev) => {
                        const last = prev[prev.length - 1]
                        if (last?.streaming) {
                            // Edge case: empty content on done
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
        )

        // Run result
        socket.on('interview:phase_change', (newPhase) => {
            setCurrentPhase(newPhase)
            setActivePhaseChange(newPhase) // Trigger the modern overlay

            if (newPhase === 'coding') {
                // Keep the toast as a fallback or secondary confirmation
                toast.success('Ready to code! The editor is now active.', {
                    description: 'Focus on implementing an optimal solution.',
                })
            } else if (newPhase === 'completed') {
                setSessionStatus('terminating')
                setActivePhaseChange('completed') // show the overlay
            }
        })

        // Terminal signal allows instant redirect without waiting for UI delays when session forcibly ends
        socket.on('interview:session_terminal', () => {
            console.log('[InterviewShell] Terminal signal received, redirecting instantly...')
            setSessionStatus('completed')
            window.location.href = `/interview/${sessionId}/result`
        })

        socket.on('interview:run_result', (result) => {
            setIsRunning(false)
            if (!result.success) {
                toast.error(`Execution Failed: ${result.error || result.verdict}`)
            } else {
                toast.success('Code executed successfully')
            }
            console.log('[InterviewShell] run_result', result)
        })

        // Submission result
        socket.on('interview:submission_result', (result) => {
            setIsSubmitting(false)
            if (!result.success || result.verdict !== 'SUCCESS') {
                toast.error(`Submission Refused: ${result.verdict}`)
            } else {
                toast.success('Solution accepted!')
            }
            console.log('[InterviewShell] submission_result', result)
        })

        // AI analysis / scorecard
        socket.on('interview:ai_analysis', (data) => {
            setMessages((prev) => [...prev, { role: 'ai', content: data.analysis }])
        })

        // AFTER — triggers the redirect when scorecard arrives:
        socket.on('interview:scorecard', (data) => {
            console.log('[InterviewShell] Scorecard received, redirecting to result page')
            setSessionStatus('completed')
            setIsTerminating(false)
            // Small delay so the phase overlay ("Interview Finalized") is visible
            setTimeout(() => {
                window.location.href = `/interview/${sessionId}/result`
            }, 1500)
        })

        // Timer ended by server
        socket.on('interview:ended', ({ status } = {}) => {
            setSessionStatus(status || 'expired')
            onEnd?.()
        })

        // Reconnection rehydration
        socket.on('reconnect', async () => {
            console.log('[InterviewShell] Socket reconnected — rehydrating...')
            setIsAiTyping(false) // Reset stuck typing state
            try {
                const res = await fetch(`/api/interview/sessions/${sessionId}/rehydrate`)
                const json = await res.json()
                if (json.success && json.data?.messages) {
                    setMessages(json.data.messages)
                    if (json.data.currentPhase) setCurrentPhase(json.data.currentPhase)
                    if (json.data.status) setSessionStatus(json.data.status)
                }
            } catch (err) {
                console.warn('[InterviewShell] Reconnection rehydration failed:', err)
            }
        })

        return () => {
            socket.off('connect')
            socket.off('disconnect')
            socket.off('connect_error')
            socket.off('reconnect_attempt')
            socket.off('reconnect_failed')
            socket.off('reconnect')
            socket.off('interview:ai_stream_chunk')
            socket.off('interview:run_result')
            socket.off('interview:submission_result')
            socket.off('interview:ai_analysis')
            socket.off('interview:scorecard')
            socket.off('interview:ended')
            socket.off('interview:phase_change')
            socket.off('interview:session_terminal')
            socket.disconnect()
        }
    }, [wsToken, sessionId, onEnd, isRehydrating])

    // ── Hard timeout for stuck AI streaming ──────────────────────────────────
    const MAX_STREAM_TIME = 45_000 // 45 seconds to allow for high-load cold-starts
    useEffect(() => {
        if (!isAiTyping) return
        const timer = setTimeout(() => {
            console.warn('[InterviewShell] AI stream timeout — forcing reset')
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

    // Hard timeout: if the scorecard socket event doesn't arrive within 90s
    // of termination, force redirect anyway. The result page will poll for
    // the result document and show a loading state until it exists.
    useEffect(() => {
        if (sessionStatus !== 'terminating') return
        const timeout = setTimeout(() => {
            console.warn('[InterviewShell] Scorecard socket event never arrived — forcing redirect')
            window.location.href = `/interview/${sessionId}/result`
        }, 90_000)
        return () => clearTimeout(timeout)
    }, [sessionStatus, sessionId])

    // ── Code change & Auto-snapshots ─────────────────────────────────────────

    const lastSavedCode = useRef(code)

    // Helper to emit snapshot
    const emitSnapshot = useCallback(
        (type = 'auto', customCode = null) => {
            const codeToSave = customCode !== null ? customCode : code
            socketRef.current?.emit('interview:code_snapshot', {
                problemId: problemState?._id,
                language,
                code: codeToSave,
                snapshotType: type,
            })
            lastSavedCode.current = codeToSave
        },
        [code, language, problemState?._id]
    )

    // Manual change handler (just updates state)
    const handleCodeChange = useCallback((newCode) => {
        setCode(newCode)
    }, [])

    // 30s interval for auto-snapshots
    useEffect(() => {
        const timer = setInterval(() => {
            if (code !== lastSavedCode.current) {
                emitSnapshot('auto')
            }
        }, 30_000)
        return () => clearInterval(timer)
    }, [code, emitSnapshot])

    // ── Run ──────────────────────────────────────────────────────────────────
    const handleRun = useCallback(() => {
        if (sessionStatus !== 'active') return
        setIsRunning(true)
        socketRef.current?.emit('interview:run', { code, language, problemId: problemState?._id })
        emitSnapshot('run')
    }, [code, language, problemState?._id, emitSnapshot, sessionStatus])

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = useCallback(() => {
        if (sessionStatus !== 'active') return
        setIsSubmitting(true)
        socketRef.current?.emit('interview:submit', {
            code,
            language,
            problemId: problemState?._id,
        })
        emitSnapshot('submit')
    }, [code, language, problemState?._id, emitSnapshot, sessionStatus])

    // ── End Session ───────────────────────────────────────────────────────────
    const handleTerminateSession = async () => {
        if (isTerminating) return
        setIsTerminating(true)
        setShowExitConfirm(false)
        try {
            const res = await fetch(`/api/interview/sessions/${sessionId}/end`, {
                method: 'POST',
            })
            const json = await res.json()
            if (json.success) {
                toast.success('Scorecard generating. Please wait...')
                setSessionStatus('terminating')
                // ✅ Do NOT redirect here.
                // The interview:scorecard socket event will fire when the worker
                // finishes and will trigger the redirect (see Change A above).
                // A 90s hard timeout below handles cases where the event never arrives.
            } else {
                throw new Error(json.error || 'Failed to terminate session')
            }
        } catch (err) {
            console.error('[InterviewShell] Failed to end session:', err)
            if (err.message?.includes('no longer active')) {
                window.location.href = `/interview/${sessionId}/result`
                return
            }
            toast.error(err.message)
            setIsTerminating(false)
        }
    }

    // ── Send chat message ─────────────────────────────────────────────────────
    const handleSendMessage = useCallback(
        (content) => {
            if (sessionStatus !== 'active') {
                toast.error('Cannot send message: Interview has ended')
                return
            }
            if (isAiTyping) {
                toast.error('Please wait for the AI to finish responding.')
                return
            }
            if (connectionStatus !== 'connected') {
                toast.error('Cannot send message while disconnected')
                return
            }

            const aiMessageId = crypto.randomUUID()

            setMessages((prev) => [
                ...prev,
                { id: crypto.randomUUID(), role: 'user', content, phase: currentPhase },
                { id: aiMessageId, role: 'ai', content: '', streaming: true },
            ])

            setIsAiTyping(true)
            socketRef.current?.emit('interview:chat_message', {
                content,
                phase: currentPhase,
                messageId: aiMessageId, // Pass the ID we generated to the backend
            })
        },
        [connectionStatus, currentPhase, sessionStatus, isAiTyping]
    )

    // ── Panel resize ──────────────────────────────────────────────────────────
    const startDragLeft = (e) => {
        e.preventDefault()
        draggingLeft.current = true
    }
    const startDragRight = (e) => {
        e.preventDefault()
        draggingRight.current = true
    }

    useEffect(() => {
        const onMove = (e) => {
            if (!containerRef.current) return
            const rect = containerRef.current.getBoundingClientRect()
            const x = e.clientX - rect.left
            const total = rect.width
            const pct = (x / total) * 100

            if (draggingLeft.current) {
                setLeftPct(Math.max(15, Math.min(40, pct)))
            }
            if (draggingRight.current) {
                setRightPct(Math.max(15, Math.min(40, 100 - pct)))
            }
        }
        const onUp = () => {
            draggingLeft.current = false
            draggingRight.current = false
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
        return () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
    }, [])

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div
            className="bg-bg-page text-text-primary relative flex h-screen w-full flex-col overflow-hidden"
            style={{ fontFamily: 'var(--font-sans)' }}
        >
            <ErrorOverlay
                error={error}
                onRetry={() => window.location.reload()}
                onExit={() => (window.location.href = '/interview/history')}
            />

            <AnimatePresence>
                {activePhaseChange && (
                    <PhaseChangeOverlay
                        phase={activePhaseChange}
                        onDismiss={() => setActivePhaseChange(null)}
                    />
                )}
            </AnimatePresence>

            <ConnectionBanner status={connectionStatus} />

            {isRehydrating && (
                <div
                    className="bg-bg-page/90 animate-in fade-in absolute inset-0 z-110 flex flex-col items-center justify-center backdrop-blur-md"
                    // Higher z-index than ErrorOverlay to avoid overlap issues during init
                >
                    <Loader2 size={40} className="text-accent mb-4 animate-spin" />
                    <p className="text-text-primary animate-pulse text-base font-bold tracking-tight">
                        Restoring your session...
                    </p>
                    <span className="text-text-muted mt-2 text-xs opacity-60">
                        Fetching chat history and latest code
                    </span>
                </div>
            )}

            {connectionStatus === 'reconnecting' && (
                <div className="bg-bg-page/80 animate-in fade-in absolute inset-0 z-110 flex flex-col items-center justify-center backdrop-blur-sm">
                    <RefreshCw size={40} className="mb-4 animate-spin text-yellow-500" />
                    <p className="text-text-primary animate-pulse text-base font-bold tracking-tight">
                        Connection lost. Resuming session...
                    </p>
                    <span className="text-text-muted mt-2 text-xs opacity-60">
                        Attempting to reconnect to the interview server
                    </span>
                </div>
            )}

            {/* ═══ Top Navbar ════════════════════════════════════════════════ */}
            <nav className="border-border bg-bg-subtle flex h-[48px] shrink-0 items-center justify-between border-b px-4">
                {/* Left */}
                <div className="flex items-center gap-3">
                    <AreanaLogo
                        href="/feed"
                        className="scale-90 transition-transform hover:scale-95"
                    />
                    <div className="bg-border h-6 w-px" />
                    <span className="text-text-secondary text-sm font-medium">Mock Interview</span>
                    {problem && (
                        <>
                            <div className="bg-border h-4 w-px" />
                            <span className="text-text-primary max-w-[200px] truncate text-xs font-semibold">
                                {problem.title}
                            </span>
                        </>
                    )}
                </div>

                {/* Center: timer */}
                {startedAtState && (
                    <InterviewTimer
                        durationMins={durationState}
                        startedAt={startedAtState}
                        onTimeExpired={() => {
                            if (sessionStatus !== 'active') return
                            toast.error('Time is up! Ending interview session...')
                            setSessionStatus('expired')
                            onEnd?.()
                        }}
                    />
                )}

                {/* Right */}
                <div className="flex items-center gap-4">
                    <div className="bg-border h-6 w-px" />
                    <button
                        onClick={() => setShowExitConfirm(true)}
                        className="bg-error/10 text-error hover:bg-error/20 flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
                    >
                        <LogOut size={14} />
                        End Interview
                    </button>
                </div>
            </nav>

            {/* ═══ Exit Confirmation Modal ═════════════════════════════════ */}
            {showExitConfirm && (
                <div className="bg-bg-page/80 fixed inset-0 z-150 flex items-center justify-center p-4 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="border-border bg-bg-subtle max-w-md rounded-4xl border p-8 shadow-2xl"
                    >
                        <div className="bg-error/15 text-error mb-6 flex h-14 w-14 items-center justify-center rounded-2xl">
                            <AlertTriangle size={28} />
                        </div>
                        <h3 className="text-text-primary mb-2 text-2xl font-black tracking-tight">
                            End Interview Early?
                        </h3>
                        <p className="text-text-secondary mb-8 text-sm leading-relaxed">
                            Are you sure you want to finish now? We will generate your scorecard
                            based on the current progress. You cannot resume after ending.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowExitConfirm(false)}
                                className="border-border text-text-primary flex-1 rounded-xl border py-3 text-sm font-bold transition-colors hover:bg-white/5"
                            >
                                Continue Interview
                            </button>
                            <button
                                onClick={handleTerminateSession}
                                disabled={isTerminating}
                                className="bg-error hover:bg-error/90 flex-1 rounded-xl py-3 text-sm font-bold text-white transition-all disabled:opacity-50"
                            >
                                {isTerminating ? (
                                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                                ) : (
                                    'End & Evaluate'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* ═══ Three-panel workspace ══════════════════════════════════════ */}
            <div ref={containerRef} className="flex flex-1 gap-1.5 overflow-hidden p-1.5">
                {/* ── Problem Panel ── */}
                <div
                    className="border-border bg-bg-subtle flex flex-col overflow-hidden rounded-xl border"
                    style={{ width: `${leftPct}%` }}
                >
                    <div className="border-border bg-bg-subtle flex h-[42px] shrink-0 items-center gap-2 border-b px-4">
                        <span className="text-text-primary text-xs font-bold">📄 Problem</span>
                    </div>
                    <ProblemPanel problem={problemState} />
                </div>

                {/* ── Left drag handle ── */}
                <div
                    onMouseDown={startDragLeft}
                    className="bg-bg-page hover:bg-accent/40 flex w-[8px] cursor-col-resize items-center justify-center transition-colors"
                >
                    <GripVertical size={12} className="text-text-muted" />
                </div>

                {/* ── Editor Panel ── */}
                <div
                    className="border-border bg-bg-subtle relative flex flex-col overflow-hidden rounded-xl border"
                    style={{ width: `${100 - leftPct - rightPct}%` }}
                >
                    {/* PART 4: Evaluation Progress Indicator */}
                    {isSubmitting && (
                        <div className="bg-bg-page/80 absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
                            <Loader2 className="text-accent mb-4 h-12 w-12 animate-spin" />
                            <p className="text-text-primary text-xl font-bold">
                                Evaluating your solution...
                            </p>
                            <p className="text-text-secondary mt-2 text-sm">
                                Alex is running your code against test cases.
                            </p>
                        </div>
                    )}
                    <EditorPanel
                        code={code}
                        onChange={handleCodeChange}
                        onRun={handleRun}
                        onSubmit={handleSubmit}
                        language={language}
                        onLanguage={setLanguage}
                        isRunning={isRunning}
                        isSubmitting={isSubmitting}
                        isReadOnly={sessionStatus !== 'active' || currentPhase !== 'coding'}
                    />
                </div>

                {/* ── Right drag handle ── */}
                <div
                    onMouseDown={startDragRight}
                    className="bg-bg-page hover:bg-accent/40 flex w-[8px] cursor-col-resize items-center justify-center transition-colors"
                >
                    <GripVertical size={12} className="text-text-muted" />
                </div>

                {/* ── AI Chat Panel ── */}
                <div
                    className="border-border bg-bg-subtle flex flex-col overflow-hidden rounded-xl border"
                    style={{ width: `${rightPct}%` }}
                >
                    <AiChatPanel
                        messages={messages}
                        onSend={handleSendMessage}
                        isAiTyping={isAiTyping}
                        currentPhase={currentPhase}
                        socket={socketRef.current}
                        setIsAiTyping={setIsAiTyping}
                        sessionId={sessionId}
                        wsToken={wsTokenState}
                    />
                </div>
            </div>
        </div>
    )
}
