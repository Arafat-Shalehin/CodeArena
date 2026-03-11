'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import {
    Clock,
    Tag,
    Star,
    Send,
    Bot,
    User as UserIcon,
    Loader2,
    GripVertical,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import AreanaLogo from '@/shared/components/ui/AreanaLogo'
import { useAuth } from '@/context/AuthContext'
import EditorPanel from './EditorPanel'

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

// ─── AiChatPanel ─────────────────────────────────────────────────────────────

function AiChatPanel({ messages, onSend, isAiTyping }) {
    const [draft, setDraft] = useState('')
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isAiTyping])

    const submit = () => {
        const trimmed = draft.trim()
        if (!trimmed) return
        onSend(trimmed)
        setDraft('')
    }

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
        }
    }

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-border bg-bg-subtle flex h-[42px] flex-shrink-0 items-center gap-2 border-b px-4">
                <Bot size={16} className="text-accent" />
                <span className="text-text-primary text-xs font-bold">AI Interviewer</span>
                {isAiTyping && (
                    <span className="text-text-muted flex items-center gap-1 text-[11px]">
                        <Loader2 size={11} className="animate-spin" /> typing…
                    </span>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.length === 0 && (
                    <div className="text-text-muted flex h-full flex-col items-center justify-center gap-2 text-center text-xs">
                        <Bot size={32} className="text-accent/40" />
                        <p>The AI interviewer will guide you through the session.</p>
                        <p className="opacity-60">Ask questions or explain your approach!</p>
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const isUser = msg.role === 'user'
                    return (
                        <div
                            key={idx}
                            className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            <div
                                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                    isUser
                                        ? 'bg-accent/20 text-accent'
                                        : 'bg-purple-500/20 text-purple-400'
                                }`}
                            >
                                {isUser ? <UserIcon size={14} /> : <Bot size={14} />}
                            </div>
                            <div
                                className={`max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                                    isUser
                                        ? 'bg-accent/15 text-text-primary rounded-tr-none'
                                        : 'bg-bg-muted text-text-secondary rounded-tl-none'
                                }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    )
                })}

                {isAiTyping && (
                    <div className="flex gap-2.5">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-400">
                            <Bot size={14} />
                        </div>
                        <div className="bg-bg-muted flex items-center gap-1 rounded-2xl rounded-tl-none px-4 py-3">
                            <span className="bg-text-muted h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
                            <span className="bg-text-muted h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
                            <span className="bg-text-muted h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-border border-t p-3">
                <div className="border-border bg-bg-muted flex items-end gap-2 rounded-xl border px-3 py-2">
                    <textarea
                        rows={1}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Ask the AI or explain your approach…"
                        className="text-text-primary placeholder:text-text-muted flex-1 resize-none bg-transparent text-[13px] outline-none"
                        style={{ maxHeight: 100 }}
                    />
                    <button
                        onClick={submit}
                        disabled={!draft.trim()}
                        className="text-accent hover:bg-accent/10 flex-shrink-0 rounded-lg p-1.5 transition-colors disabled:opacity-40"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <p className="text-text-muted mt-1.5 text-center text-[10px]">
                    Enter to send · Shift+Enter for newline
                </p>
            </div>
        </div>
    )
}

// ─── Timer ───────────────────────────────────────────────────────────────────

function InterviewTimer({ durationMins, startedAt }) {
    const totalSeconds = durationMins * 60
    const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
    const [remaining, setRemaining] = useState(Math.max(0, totalSeconds - elapsed))

    useEffect(() => {
        if (remaining <= 0) return
        const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
        return () => clearInterval(id)
    }, [remaining])

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
    onEnd,
}) {
    const { user } = useAuth()

    // ── Code editor state ────────────────────────────────────────────────────
    const [code, setCode] = useState(problem?.defaultCode?.python ?? '')
    const [language, setLanguage] = useState('python')
    const [isRunning, setIsRunning] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // ── Chat state ────────────────────────────────────────────────────────────
    const [messages, setMessages] = useState([])
    const [isAiTyping, setIsAiTyping] = useState(false)

    // ── Layout: left-panel width ratio ───────────────────────────────────────
    const [leftPct, setLeftPct] = useState(30) // % for problem description
    const [rightPct, setRightPct] = useState(30) // % for AI chat
    const containerRef = useRef(null)
    const draggingLeft = useRef(false)
    const draggingRight = useRef(false)

    // ── Socket.IO connection ─────────────────────────────────────────────────
    const socketRef = useRef(null)

    useEffect(() => {
        if (!wsToken || !sessionId) return

        const socket = io(
            `${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002'}/interview`,
            {
                auth: { token: wsToken },
                reconnectionAttempts: 3,
            }
        )
        socketRef.current = socket

        socket.on('connect', () => {
            socket.emit('interview:join')
        })

        // ── Server-to-client events ──────────────────────────────────────────

        // AI streaming
        socket.on('interview:ai_stream_chunk', ({ chunk, done }) => {
            if (!done) {
                setIsAiTyping(true)
                setMessages((prev) => {
                    const last = prev[prev.length - 1]
                    if (last && last.role === 'ai' && last.streaming) {
                        return [...prev.slice(0, -1), { ...last, content: last.content + chunk }]
                    }
                    return [...prev, { role: 'ai', content: chunk, streaming: true }]
                })
            } else {
                setIsAiTyping(false)
                setMessages((prev) => {
                    const last = prev[prev.length - 1]
                    if (last?.streaming)
                        return [...prev.slice(0, -1), { ...last, streaming: false }]
                    return prev
                })
            }
        })

        // Run result
        socket.on('interview:run_result', (result) => {
            setIsRunning(false)
            // TODO: surface result UI (console panel)
            console.log('[InterviewShell] run_result', result)
        })

        // Submission result
        socket.on('interview:submission_result', (result) => {
            setIsSubmitting(false)
            console.log('[InterviewShell] submission_result', result)
        })

        // AI analysis / scorecard
        socket.on('interview:ai_analysis', (data) => {
            setMessages((prev) => [...prev, { role: 'ai', content: data.analysis }])
        })

        socket.on('interview:scorecard', (data) => {
            console.log('[InterviewShell] scorecard', data)
        })

        // Timer ended by server
        socket.on('interview:ended', () => {
            onEnd?.()
        })

        return () => {
            socket.disconnect()
        }
    }, [wsToken, sessionId, onEnd])

    // ── Run ──────────────────────────────────────────────────────────────────
    const handleRun = useCallback(() => {
        setIsRunning(true)
        socketRef.current?.emit('interview:run', { code, language, problemId: problem?._id })
        // Snapshot the code as well
        socketRef.current?.emit('interview:code_snapshot', {
            problemId: problem?._id,
            language,
            code,
            snapshotType: 'run',
        })
    }, [code, language, problem])

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = useCallback(() => {
        setIsSubmitting(true)
        socketRef.current?.emit('interview:submit', { code, language, problemId: problem?._id })
        socketRef.current?.emit('interview:code_snapshot', {
            problemId: problem?._id,
            language,
            code,
            snapshotType: 'submit',
        })
    }, [code, language, problem])

    // ── Code change (auto-snapshot every 60 s) ────────────────────────────────
    const lastSnapshot = useRef(Date.now())
    const handleCodeChange = useCallback(
        (newCode) => {
            setCode(newCode)
            if (Date.now() - lastSnapshot.current > 60_000) {
                lastSnapshot.current = Date.now()
                socketRef.current?.emit('interview:code_snapshot', {
                    problemId: problem?._id,
                    language,
                    code: newCode,
                    snapshotType: 'auto',
                })
            }
        },
        [language, problem]
    )

    // ── Send chat message ─────────────────────────────────────────────────────
    const handleSendMessage = useCallback((content) => {
        setMessages((prev) => [...prev, { role: 'user', content }])
        setIsAiTyping(true)
        socketRef.current?.emit('interview:chat_message', { content, phase: 'coding' })
    }, [])

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
            className="bg-bg-page text-text-primary flex h-screen w-full flex-col overflow-hidden"
            style={{ fontFamily: 'var(--font-sans)' }}
        >
            {/* ═══ Top Navbar ════════════════════════════════════════════════ */}
            <nav className="border-border bg-bg-subtle flex h-[48px] flex-shrink-0 items-center justify-between border-b px-4">
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
                {startedAt && <InterviewTimer durationMins={durationMins} startedAt={startedAt} />}

                {/* Right */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onEnd}
                        className="rounded-md border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10"
                    >
                        End Session
                    </button>
                </div>
            </nav>

            {/* ═══ Three-panel workspace ══════════════════════════════════════ */}
            <div ref={containerRef} className="flex flex-1 gap-1.5 overflow-hidden p-1.5">
                {/* ── Problem Panel ── */}
                <div
                    className="border-border bg-bg-subtle flex flex-col overflow-hidden rounded-xl border"
                    style={{ width: `${leftPct}%` }}
                >
                    <div className="border-border bg-bg-subtle flex h-[42px] flex-shrink-0 items-center gap-2 border-b px-4">
                        <span className="text-text-primary text-xs font-bold">📄 Problem</span>
                    </div>
                    <ProblemPanel problem={problem} />
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
                    className="border-border bg-bg-subtle flex flex-col overflow-hidden rounded-xl border"
                    style={{ width: `${100 - leftPct - rightPct}%` }}
                >
                    <EditorPanel
                        code={code}
                        onChange={handleCodeChange}
                        language={language}
                        onLanguage={setLanguage}
                        onRun={handleRun}
                        onSubmit={handleSubmit}
                        isRunning={isRunning}
                        isSubmitting={isSubmitting}
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
                    />
                </div>
            </div>
        </div>
    )
}
