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
} from 'lucide-react'
import Link from 'next/link'

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

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-500" />
                <p className="font-medium text-slate-400">Reconstructing your session...</p>
            </div>
        )
    }

    if (!data) return <div>Error loading session</div>

    return (
        <div className="flex h-screen flex-col bg-[#0a0a0a] text-white">
            {/* Header */}
            <header className="flex h-16 items-center justify-between border-b border-white/5 bg-[#0d0d0d] px-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/interview/history"
                        className="rounded-lg p-2 text-slate-400 hover:bg-white/5"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-sm leading-tight font-bold text-white">
                            {data.session.problemIds?.[0]?.title || 'Replay'}
                        </h1>
                        <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                            Review Session • {format(new Date(data.session.startedAt), 'PPp')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {data.result && (
                        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-1.5">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold tracking-tighter text-slate-500 uppercase">
                                    Performance
                                </span>
                                <span className="text-sm font-black text-white">
                                    {data.result.overallScore}/100
                                </span>
                            </div>
                        </div>
                    )}
                    <Link
                        href={`/interview/${sessionId}/result`}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold transition-colors hover:bg-blue-500"
                    >
                        View Full Report
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-1 overflow-hidden">
                {/* Left Side: Code Editor */}
                <div className="flex min-w-0 flex-1 flex-col border-r border-white/5">
                    <div className="flex h-10 items-center justify-between border-b border-white/5 bg-black/40 px-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <FileCode className="h-4 w-4" />
                            CODE SNAPSHOT
                        </div>
                        <div className="font-mono text-[10px] text-slate-500 uppercase">
                            {currentLanguage}
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            language={currentLanguage === 'cpp' ? 'cpp' : currentLanguage}
                            value={currentCode}
                            theme="vs-dark"
                            options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                fontSize: 13,
                                fontFamily: "'JetBrains Mono', monospace",
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 10 },
                            }}
                        />
                    </div>
                </div>

                {/* Right Side: Chat Transcript */}
                <div className="flex w-[380px] flex-col bg-[#0d0d0d]">
                    <div className="flex h-10 items-center border-b border-white/5 bg-black/40 px-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <MessageSquare className="h-4 w-4" />
                            TRANSCRIPT
                        </div>
                    </div>
                    <div className="flex-1 space-y-4 overflow-y-auto p-4">
                        {currentTranscript.map((event, idx) => (
                            <div
                                key={idx}
                                className={`flex flex-col gap-1.5 ${
                                    event.data.role === 'ai' ? 'items-start' : 'items-end'
                                }`}
                            >
                                <span className="px-1 text-[9px] font-black tracking-widest text-slate-500 uppercase">
                                    {event.data.role === 'ai'
                                        ? 'Alex (AI Interviwer)'
                                        : 'Candidate'}
                                </span>
                                <div
                                    className={`max-w-[90%] rounded-2xl px-3 py-2.5 text-[13px] leading-relaxed shadow-lg ${
                                        event.data.role === 'ai'
                                            ? 'rounded-tl-none bg-slate-800 text-slate-200'
                                            : 'rounded-tr-none bg-blue-600 text-white'
                                    }`}
                                >
                                    {event.data.content}
                                </div>
                            </div>
                        ))}
                        {currentTranscript.length === 0 && (
                            <p className="py-20 text-center text-xs font-medium text-slate-600">
                                Waiting for conversation to start...
                            </p>
                        )}
                    </div>
                </div>
            </main>

            {/* Timeline & Controls */}
            <footer className="h-24 border-t border-white/5 bg-[#0d0d0d] p-4">
                <div className="mx-auto flex max-w-4xl flex-col gap-3">
                    {/* Progress Slider */}
                    <div className="flex items-center gap-4">
                        <span className="w-10 text-right font-mono text-[10px] text-slate-500">
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
                            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-800 accent-blue-500"
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
                            className="rounded-full p-2 text-slate-400 hover:bg-white/5"
                        >
                            <SkipBack className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-all hover:scale-110 active:scale-95"
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
                            className="rounded-full p-2 text-slate-400 hover:bg-white/5"
                        >
                            <SkipForward className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    )
}
