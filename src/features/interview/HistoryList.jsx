'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Calendar, Clock, Award, Code2, PlayCircle, Loader2 } from 'lucide-react'

export default function HistoryList() {
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/interview/sessions')
                const json = await res.json()
                if (json.success) {
                    setSessions(json.data)
                }
            } catch (error) {
                console.error('Failed to fetch interview history:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchHistory()
    }, [])

    if (loading) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                <p className="font-medium text-slate-400">Loading your journey...</p>
            </div>
        )
    }

    if (sessions.length === 0) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center px-4 text-center">
                <div className="mb-6 rounded-full bg-slate-800/50 p-6">
                    <Code2 className="h-12 w-12 text-slate-500" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-white">No interviews yet</h3>
                <p className="mb-8 max-w-md text-slate-400">
                    You haven't completed any AI interviews yet. Start your first session to receive
                    personalized feedback and track your progress.
                </p>
                <Link
                    href="/interview"
                    className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition-all hover:scale-105 hover:bg-blue-500"
                >
                    Start New Interview
                </Link>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-12">
            <header className="mb-12">
                <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white">
                    Interview <span className="text-blue-500">History</span>
                </h1>
                <p className="text-lg text-slate-400">
                    Track your growth, review past performance, and master your technical
                    communication.
                </p>
            </header>

            <div className="grid gap-6">
                {sessions.map((session) => (
                    <div
                        key={session._id}
                        className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 transition-all duration-300 hover:border-blue-500/50 hover:bg-slate-900/60"
                    >
                        {/* Background subtle glow on hover */}
                        <div className="absolute -inset-1 -z-1 rounded-2xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 opacity-0 blur transition-opacity duration-500 group-hover:opacity-100" />

                        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-500/10 p-2">
                                        <Code2 className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white transition-colors group-hover:text-blue-400">
                                        {session.problemIds?.[0]?.title || 'Unknown Problem'}
                                    </h3>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase ${
                                            session.status === 'completed'
                                                ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                                : 'border border-orange-500/20 bg-orange-500/10 text-orange-400'
                                        }`}
                                    >
                                        {session.status}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {format(new Date(session.startedAt), 'PPP')}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        {format(new Date(session.startedAt), 'p')}
                                    </div>
                                    <div className="flex items-center gap-2 capitalize">
                                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                                        {session.mode} Round
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {session.status === 'completed' && (
                                    <div className="flex flex-col items-end border-r border-slate-800 px-4">
                                        <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                                            Overall Score
                                        </span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-white">
                                                {session.finalScore || '—'}
                                            </span>
                                            <span className="text-sm font-bold text-slate-500">
                                                /100
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/interview/${session._id}/replay`}
                                        className="flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-3 font-bold text-white transition-all hover:bg-slate-700 active:scale-95"
                                    >
                                        <PlayCircle className="h-5 w-5 text-blue-400" />
                                        Replay
                                    </Link>
                                    <Link
                                        href={`/interview/${session._id}/result`}
                                        className="rounded-xl bg-slate-800/50 p-3 text-slate-300 transition-all hover:bg-slate-800"
                                        title="View Detailed Report"
                                    >
                                        <Award className="h-5 w-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
