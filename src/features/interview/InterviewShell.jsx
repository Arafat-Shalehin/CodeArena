'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Loader2, GripVertical, LogOut, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import AreanaLogo from '@/shared/components/ui/AreanaLogo'
import EditorPanel from './EditorPanel'
import ConnectionBanner from './components/shared/ConnectionBanner'
import ErrorOverlay from './components/shared/ErrorOverlay'
import InterviewTimer from './components/shared/InterviewTimer'
import ProblemPanel from './components/problem/ProblemPanel'
import AiChatPanel from './components/chat/AiChatPanel'
import { InterviewProvider, useInterview } from './context/InterviewContext'

function InterviewShellUI() {
    const {
        problem,
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
    } = useInterview()

    // ── Layout: left-panel width ratio ───────────────────────────────────────
    const [leftPct, setLeftPct] = useState(30)
    const [rightPct, setRightPct] = useState(30)
    const containerRef = useRef(null)
    const draggingLeft = useRef(false)
    const draggingRight = useRef(false)

    // ── Resizing Logic ───────────────────────────────────────────────
    const startDragLeft = (e) => {
        e.preventDefault()
        draggingLeft.current = true
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
        document.body.style.cursor = 'col-resize'
    }

    const startDragRight = (e) => {
        e.preventDefault()
        draggingRight.current = true
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
        document.body.style.cursor = 'col-resize'
    }

    const onMouseMove = useCallback((e) => {
        if (!containerRef.current) return
        const { left, width } = containerRef.current.getBoundingClientRect()
        const mouseX = e.clientX - left

        if (draggingLeft.current) {
            let newLeftPct = (mouseX / width) * 100
            if (newLeftPct < 15) newLeftPct = 15
            if (newLeftPct > 50) newLeftPct = 50
            setLeftPct(newLeftPct)
        } else if (draggingRight.current) {
            const rightWidth = width - mouseX
            let newRightPct = (rightWidth / width) * 100
            if (newRightPct < 15) newRightPct = 15
            if (newRightPct > 50) newRightPct = 50
            setRightPct(newRightPct)
        }
    }, [])

    const onMouseUp = useCallback(() => {
        draggingLeft.current = false
        draggingRight.current = false
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        document.body.style.cursor = 'default'
    }, [onMouseMove])

    // Wait until rehydration is complete to render the core UI
    if (isRehydrating) {
        return (
            <div className="bg-bg-page flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="text-accent animate-spin" />
                    <p className="text-text-secondary font-mono text-sm tracking-widest uppercase">
                        Restoring Session...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-bg-page flex h-screen flex-col overflow-hidden">
            <ConnectionBanner status={connectionStatus} />
            <ErrorOverlay error={error} onRetry={handleRetryNetwork} onExit={handleExitPanic} />

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
                {startedAtState && (
                    <InterviewTimer
                        durationMins={durationState}
                        startedAt={startedAtState}
                        onTimeExpired={() => {
                            if (sessionStatus !== 'active') return
                            handleTerminateSession()
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
                <div className="bg-bg-page/80 fixed inset-0 z-[150] flex items-center justify-center p-4 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="border-border bg-bg-subtle max-w-md rounded-[2rem] border p-8 shadow-2xl"
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
                    className="border-border bg-bg-subtle relative flex flex-col overflow-hidden rounded-xl border"
                    style={{ width: `${100 - leftPct - rightPct}%` }}
                >
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
                        onChange={(newCode) => setCode(newCode)}
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
                    />
                </div>
            </div>
        </div>
    )
}

export default function InterviewShell(props) {
    return (
        <InterviewProvider {...props}>
            <InterviewShellUI />
        </InterviewProvider>
    )
}
