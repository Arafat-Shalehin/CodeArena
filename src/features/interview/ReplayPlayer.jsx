'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Editor from '@monaco-editor/react'
import { format } from 'date-fns'
import {
    ChevronLeft,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    MessageSquare,
    FileCode,
    Award,
    Loader2,
    Clock,
    Zap,
    Calendar,
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from 'next-themes'

export default function ReplayPlayer({ sessionId }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/interview/sessions/${sessionId}/details`)
                const json = await res.json()
                if (json.success) {
                    setData(json.data)
                    // Start at the end to show final result, or at start?
                    // Let's start at index 0 for a true "replay" feel.
                }
            } catch (error) {
                console.error('Failed to fetch replay details:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [sessionId])

    // Combine messages and snapshots into a single timeline
    const timeline = useMemo(() => {
        if (!data) return []

        const events = [
            ...data.messages.map((m) => ({ type: 'message', ts: new Date(m.ts), data: m })),
            ...data.snapshots.map((s) => ({ type: 'snapshot', ts: new Date(s.ts), data: s })),
        ]

        return events.sort((a, b) => a.ts - b.ts)
    }, [data])

    // Derived state: current code and transcript
    const currentCode = useMemo(() => {
        if (!timeline.length) return ''
        // Find latest snapshot up to current index
        for (let i = currentIndex; i >= 0; i--) {
            if (timeline[i].type === 'snapshot') {
                return timeline[i].data.code
            }
        }
        // Fallback to initial code from session if available (or empty)
        return ''
    }, [timeline, currentIndex])

    const currentTranscript = useMemo(() => {
        return timeline.slice(0, currentIndex + 1).filter((e) => e.type === 'message')
    }, [timeline, currentIndex])

    const currentLanguage = useMemo(() => {
        if (!timeline.length) return 'python'
        for (let i = currentIndex; i >= 0; i--) {
            if (timeline[i].type === 'snapshot') {
                return timeline[i].data.language
            }
        }
        return 'python'
    }, [timeline, currentIndex])

    // Auto-play logic
    useEffect(() => {
        let timer
        if (isPlaying && currentIndex < timeline.length - 1) {
            timer = setTimeout(() => {
                setCurrentIndex((prev) => prev + 1)
            }, 1000) // 1 second per event (simplified)
        } else if (currentIndex === timeline.length - 1) {
            setIsPlaying(false)
        }
        return () => clearTimeout(timer)
    }, [isPlaying, currentIndex, timeline.length])

    const { resolvedTheme } = useTheme()

    if (loading) {
        return (
            <div className="bg-bg-page flex min-h-screen flex-col items-center justify-center">
                <Loader2 className="text-accent mb-4 h-12 w-12 animate-spin" />
                <p className="text-text-secondary font-medium">Reconstructing your session...</p>
            </div>
        )
    }

    if (!data)
        return <div className="text-text-primary p-20 text-center">Error loading session</div>

    const sessionDuration = data.session.endedAt
        ? Math.round((new Date(data.session.endedAt) - new Date(data.session.startedAt)) / 60000)
        : '?'

    return (
        <div className="bg-bg-page text-text-primary flex h-screen flex-col">
            {/* Header */}
            <header className="border-border bg-bg-subtle/80 sticky top-0 z-50 flex h-16 items-center justify-between border-b px-6 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <Link
                        href="/interview/history"
                        className="hover:bg-bg-muted text-text-muted rounded-lg p-2 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-text-primary text-sm font-black tracking-tight uppercase">
                            {data.session.problemIds?.[0]?.title || 'Replay'}
                        </h1>
                        <div className="text-text-muted flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                            <Calendar size={10} />
                            {format(new Date(data.session.startedAt), 'PPp')}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Summary Badges */}
                    <div className="hidden items-center gap-3 sm:flex">
                        <div className="border-border bg-bg-muted/50 flex items-center gap-2 rounded-xl border px-3 py-1.5">
                            <Clock className="text-accent h-3.5 w-3.5" />
                            <div className="flex flex-col">
                                <span className="text-text-muted text-[8px] font-bold uppercase">
                                    Duration
                                </span>
                                <span className="text-xs font-bold">{sessionDuration} min</span>
                            </div>
                        </div>
                        {data.result && (
                            <div className="border-border bg-bg-muted/50 flex items-center gap-2 rounded-xl border px-3 py-1.5">
                                <Award className="h-3.5 w-3.5 text-yellow-500" />
                                <div className="flex flex-col">
                                    <span className="text-text-muted text-[8px] font-bold uppercase">
                                        Score
                                    </span>
                                    <span className="text-xs font-bold">
                                        {data.result.overallScore}/100
                                    </span>
                                </div>
                            </div>
                        )}
                        <div
                            className={`border-border bg-bg-muted/50 flex items-center gap-2 rounded-xl border px-3 py-1.5`}
                        >
                            <Zap
                                className={`h-3.5 w-3.5 ${data.session.status === 'completed' ? 'text-success' : 'text-warning'}`}
                            />
                            <div className="flex flex-col">
                                <span className="text-text-muted text-[8px] font-bold uppercase">
                                    Status
                                </span>
                                <span className="text-xs font-bold capitalize">
                                    {data.session.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Link
                        href={`/interview/${sessionId}/result`}
                        className="bg-accent shadow-accent/20 hover:bg-accent-hover hidden rounded-lg px-4 py-2 text-xs font-black text-black transition-all sm:block"
                    >
                        FULL REPORT
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-1 overflow-hidden">
                {/* Left Side: Code Editor */}
                <div className="border-border bg-bg-page flex min-w-0 flex-1 flex-col border-r">
                    <div className="border-border bg-bg-subtle/50 flex h-10 items-center justify-between border-b px-4">
                        <div className="text-text-secondary flex items-center gap-2 text-xs font-bold">
                            <FileCode className="text-accent h-4 w-4" />
                            CODE SNAPSHOT
                        </div>
                        <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase">
                            {currentLanguage}
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            language={currentLanguage === 'cpp' ? 'cpp' : currentLanguage}
                            value={currentCode}
                            theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
                            options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                fontSize: 13,
                                fontFamily: "'JetBrains Mono', monospace",
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 10 },
                                renderLineHighlight: 'all',
                                lineNumbers: 'on',
                            }}
                        />
                    </div>
                </div>

                {/* Right Side: Chat Transcript */}
                <div className="bg-bg-subtle flex w-[400px] flex-col overflow-hidden">
                    <div className="border-border bg-bg-muted/50 flex h-10 items-center border-b px-4">
                        <div className="text-text-secondary flex items-center gap-2 text-xs font-bold">
                            <MessageSquare className="text-accent h-4 w-4" />
                            TRANSCRIPT
                        </div>
                    </div>
                    <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-4">
                        {currentTranscript.map((event, idx) => (
                            <div
                                key={idx}
                                className={`flex flex-col gap-1.5 ${
                                    event.data.role === 'ai' ? 'items-start' : 'items-end'
                                }`}
                            >
                                <span className="text-text-muted px-2 text-[9px] font-black tracking-widest uppercase">
                                    {event.data.role === 'ai' ? 'ALEX (AI)' : 'YOU'}
                                </span>
                                <div
                                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${
                                        event.data.role === 'ai'
                                            ? 'bg-bg-muted text-text-primary rounded-tl-none'
                                            : 'bg-accent rounded-tr-none font-medium text-black'
                                    }`}
                                >
                                    {event.data.content}
                                </div>
                            </div>
                        ))}
                        {currentTranscript.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Bot className="text-text-muted mb-4 h-12 w-12 opacity-20" />
                                <p className="text-text-muted text-xs font-medium">
                                    Waiting for conversation to start...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Timeline & Controls */}
            <footer className="border-border bg-bg-subtle border-t p-4">
                <div className="mx-auto flex max-w-4xl flex-col gap-3">
                    {/* Progress Slider */}
                    <div className="flex items-center gap-4">
                        <span className="text-text-muted w-10 text-right font-mono text-[10px]">
                            {currentIndex + 1} / {timeline.length}
                        </span>
                        <input
                            type="range"
                            min="0"
                            max={Math.max(0, timeline.length - 1)}
                            value={currentIndex}
                            onChange={(e) => {
                                setCurrentIndex(parseInt(e.target.value))
                                setIsPlaying(false)
                            }}
                            className="bg-bg-muted accent-accent h-1.5 flex-1 cursor-pointer appearance-none rounded-lg"
                        />
                        <span className="font-mono text-[10px] text-slate-500">
                            {timeline[currentIndex]
                                ? format(timeline[currentIndex].ts, 'p')
                                : '--:--'}
                        </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-center gap-6">
                        <button
                            onClick={() => {
                                setCurrentIndex(0)
                                setIsPlaying(false)
                            }}
                            className="hover:bg-bg-muted text-text-muted rounded-full p-2 transition-colors"
                        >
                            <SkipBack className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="bg-accent hover:bg-accent-hover shadow-accent/20 flex h-10 w-10 items-center justify-center rounded-full text-black shadow-lg transition-all hover:scale-110 active:scale-95"
                        >
                            {isPlaying ? (
                                <Pause className="h-5 w-5 fill-current" />
                            ) : (
                                <Play className="h-5 w-5 translate-x-0.5 fill-current" />
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setCurrentIndex(timeline.length - 1)
                                setIsPlaying(false)
                            }}
                            className="hover:bg-bg-muted text-text-muted rounded-full p-2 transition-colors"
                        >
                            <SkipForward className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    )
}
