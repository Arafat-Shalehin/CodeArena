'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
    Calendar,
    Clock,
    Award,
    Code2,
    PlayCircle,
    Loader2,
    Sparkles,
    ChevronRight,
    Bot,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

const SkeletonCard = () => (
    <div className="border-border bg-bg-subtle/20 flex animate-pulse flex-col items-center gap-8 rounded-2xl border p-6 md:flex-row">
        <div className="bg-border/40 h-16 w-16 rounded-xl" />
        <div className="w-full flex-1 space-y-3">
            <div className="bg-border/40 h-6 w-1/3 rounded-md" />
            <div className="bg-border/20 h-3 w-1/2 rounded-sm" />
        </div>
        <div className="flex w-full gap-3 md:w-auto">
            <div className="bg-border/30 h-10 w-24 rounded-lg" />
            <div className="bg-border/50 h-10 w-32 rounded-lg" />
        </div>
    </div>
)

export default function HistoryList() {
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/interview/sessions')
                const json = await res.json()
                if (json.success) {
                    setSessions(json.data || [])
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
            <div className="space-y-4 py-8">
                {[...Array(3)].map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        )
    }

    if (sessions.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex min-h-[500px] flex-col items-center justify-center px-4 text-center"
            >
                <div className="bg-bg-subtle border-border mb-8 rounded-2xl border p-10 shadow-sm transition-transform duration-500 hover:scale-105">
                    <Bot className="text-accent h-16 w-16" />
                </div>
                <h3 className="text-text-primary mb-4 text-4xl font-black tracking-tighter">
                    Stage is <span className="text-accent font-normal italic">Empty.</span>
                </h3>
                <p className="text-text-secondary mb-10 max-w-md text-base leading-relaxed font-medium opacity-70">
                    Alex is waiting in the sandbox. Start your first session to receive elite
                    technical coaching and performance metrics.
                </p>
                <Link href="/interview/new">
                    <Button
                        size="lg"
                        className="bg-accent hover:bg-accent-hover shadow-accent/10 h-14 rounded-md px-10 text-sm font-bold tracking-[0.2em] text-white uppercase shadow-lg transition-all active:scale-95"
                    >
                        Enter the Sandbox
                    </Button>
                </Link>
            </motion.div>
        )
    }

    return (
        <div className="py-8">
            <header className="mb-10">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                    <div className="space-y-1">
                        <div className="text-accent text-[10px] font-black tracking-[0.4em] uppercase">
                            Analytics Engine
                        </div>
                        <h2 className="text-text-primary text-3xl font-black tracking-tight">
                            Past Sessions
                        </h2>
                    </div>
                </div>
            </header>

            <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                    {sessions.map((session, index) => (
                        <motion.div
                            key={session._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ delay: index * 0.05, duration: 0.6 }}
                            className="group relative"
                        >
                            <div className="border-border bg-bg-subtle/20 hover:bg-bg-subtle/40 hover:border-text-muted/30 relative overflow-hidden rounded-2xl border p-1 transition-all duration-300">
                                <div className="flex flex-col items-center gap-6 p-5 md:flex-row md:p-6">
                                    {/* Problem Icon (Monochrome) */}
                                    <div className="bg-bg-page border-border group-hover:border-accent/40 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl border shadow-sm transition-all duration-300 group-hover:scale-105">
                                        <Code2
                                            className={`h-8 w-8 transition-colors ${session.finalScore >= 70 ? 'text-accent' : 'text-text-muted'}`}
                                        />
                                    </div>

                                    {/* Title & Meta */}
                                    <div className="flex-1 space-y-4 text-center md:text-left">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                                                <h3 className="text-text-primary text-xl font-bold tracking-tight">
                                                    {session.problemIds?.[0]?.title ||
                                                        'System Analysis'}
                                                </h3>
                                                <span
                                                    className={`rounded-full border px-2.5 py-0.5 text-[8px] font-black tracking-widest uppercase ${
                                                        session.status === 'completed'
                                                            ? 'border-accent/20 bg-accent/5 text-accent'
                                                            : session.status === 'terminated'
                                                              ? 'border-red-500/20 bg-red-500/5 text-red-500'
                                                              : 'border-text-muted/20 bg-text-muted/5 text-text-muted'
                                                    }`}
                                                >
                                                    {session.status}
                                                </span>
                                            </div>

                                            <div className="text-text-muted flex flex-wrap items-center justify-center gap-4 text-[9px] font-black tracking-[0.2em] uppercase md:justify-start">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(
                                                        new Date(session.startedAt || Date.now()),
                                                        'MMM d, yyyy'
                                                    )}
                                                </div>
                                                <div className="bg-border h-1 w-1 rounded-full" />
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3 w-3" />
                                                    {format(
                                                        new Date(session.startedAt || Date.now()),
                                                        'h:mm a'
                                                    )}
                                                </div>
                                                <div className="bg-border h-1 w-1 rounded-full" />
                                                <div className="text-accent flex items-center gap-1.5">
                                                    <div className="h-1 w-1 rounded-full bg-current" />
                                                    {session.mode || 'Practice'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Score Display (High Density) */}
                                    {session.status === 'completed' &&
                                        session.finalScore !== undefined && (
                                            <div className="border-border/50 flex flex-col items-center justify-center border-x px-8 text-center md:items-end md:text-right">
                                                <span className="text-text-muted mb-1 text-[8px] font-black tracking-[0.3em] uppercase opacity-70">
                                                    Score
                                                </span>
                                                <div className="flex items-baseline gap-1">
                                                    <span
                                                        className={`text-2xl font-black tracking-tighter ${session.finalScore >= 70 ? 'text-accent' : 'text-text-primary'}`}
                                                    >
                                                        {session.finalScore}
                                                    </span>
                                                    <span className="text-text-muted text-[10px] font-bold">
                                                        /100
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                    {/* Action Buttons */}
                                    <div className="flex w-full flex-shrink-0 items-center gap-2 md:w-auto">
                                        <Link
                                            href={`/interview/${session._id}${session.status === 'active' ? '' : '/replay'}`}
                                            className="flex-1 md:flex-initial"
                                        >
                                            <Button
                                                variant="outline"
                                                className="border-border hover:bg-bg-subtle text-text-muted hover:text-text-primary h-10 w-full rounded-md px-5 text-[10px] font-bold tracking-widest uppercase transition-all md:w-auto"
                                            >
                                                {session.status === 'active' ? 'Resume' : 'Replay'}
                                            </Button>
                                        </Link>
                                        <Link
                                            href={`/interview/${session._id}/${session.status === 'active' ? '' : 'result'}`}
                                            className="flex-1 md:flex-initial"
                                        >
                                            <Button
                                                className={`h-10 w-full rounded-md px-5 text-[10px] font-bold tracking-widest uppercase transition-all md:w-auto ${
                                                    session.status === 'active'
                                                        ? 'bg-accent shadow-accent/10 text-white shadow-lg'
                                                        : 'hover:bg-accent bg-white text-black hover:text-white'
                                                }`}
                                            >
                                                {session.status === 'active' ? 'Join' : 'Result'}
                                                <ChevronRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
