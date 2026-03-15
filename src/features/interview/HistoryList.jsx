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
    <div className="border-border bg-bg-subtle/20 flex animate-pulse flex-col items-center gap-8 rounded-[2.5rem] border p-8 backdrop-blur-xl md:flex-row">
        <div className="bg-border/40 h-20 w-20 rounded-2xl" />
        <div className="w-full flex-1 space-y-4">
            <div className="bg-border/40 h-8 w-1/3 rounded-xl" />
            <div className="bg-border/20 h-4 w-1/2 rounded-lg" />
        </div>
        <div className="flex w-full gap-3 md:w-auto">
            <div className="bg-border/30 h-14 w-32 rounded-2xl" />
            <div className="bg-border/50 h-14 w-40 rounded-2xl" />
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
            <div className="mx-auto max-w-6xl space-y-6 px-4 py-12">
                <div className="bg-border h-10 w-64 animate-pulse rounded" />
                <div className="grid gap-6">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
        )
    }

    if (sessions.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex min-h-[600px] flex-col items-center justify-center px-4 text-center"
            >
                <div className="group relative mb-8">
                    <div className="bg-accent/15 group-hover:bg-accent/25 absolute -inset-8 rounded-full blur-3xl transition-colors duration-700" />
                    <div className="bg-bg-subtle/50 border-border relative rounded-[3rem] border p-12 shadow-2xl backdrop-blur-2xl transition-transform duration-500 group-hover:scale-110">
                        <Bot className="text-accent h-20 w-20 transition-transform duration-700 group-hover:rotate-12" />
                    </div>
                </div>
                <h3 className="text-text-primary mb-4 text-4xl font-[1000] tracking-tighter">
                    Your Stage is Empty
                </h3>
                <p className="text-text-secondary mb-12 max-w-md text-lg leading-relaxed font-medium">
                    Alex is waiting in the sandbox. Start your first session to receive elite
                    technical coaching and performance metrics.
                </p>
                <Link href="/interview/new">
                    <Button
                        size="lg"
                        className="bg-accent hover:bg-accent-hover shadow-accent/20 h-16 rounded-[1.5rem] px-12 text-lg font-[1000] tracking-widest text-black uppercase shadow-2xl transition-all hover:scale-105 active:scale-95"
                    >
                        <Sparkles className="mr-3 h-6 w-6" />
                        Enter the Sandbox
                    </Button>
                </Link>
            </motion.div>
        )
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-5">
            <header className="mb-12 space-y-4">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="text-center md:text-left">
                        <h2 className="text-text-primary text-2xl font-black tracking-tight md:text-3xl">
                            Past Sessions
                        </h2>
                        <p className="text-text-muted text-sm font-medium">
                            {sessions.length} interviews completed so far
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid gap-6">
                <AnimatePresence mode="popLayout">
                    {sessions.map((session, index) => (
                        <motion.div
                            key={session._id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05, type: 'spring', damping: 20 }}
                            className="group relative"
                        >
                            {/* Ambient Glow */}
                            <div className="bg-accent/5 pointer-events-none absolute -inset-4 rounded-[3rem] opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100" />

                            <div className="border-border bg-bg-subtle/30 group-hover:bg-bg-subtle/50 group-hover:border-accent/20 relative overflow-hidden rounded-[2.5rem] border p-1 shadow-2xl backdrop-blur-2xl transition-all duration-500 group-hover:-translate-y-1">
                                <div className="flex flex-col items-center gap-8 p-6 md:flex-row md:p-8">
                                    {/* Problem Icon */}
                                    <div className="relative flex-shrink-0">
                                        <div className="bg-accent/20 absolute inset-0 rounded-2xl opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                                        <div className="bg-bg-page border-border group-hover:border-accent/40 relative flex h-20 w-20 items-center justify-center rounded-2xl border shadow-inner transition-colors duration-500">
                                            <Code2
                                                className={`h-10 w-10 ${session.finalScore >= 70 ? 'text-accent' : 'text-text-muted'} transition-transform duration-500 group-hover:scale-110`}
                                            />
                                        </div>
                                    </div>

                                    {/* Title & Meta */}
                                    <div className="flex-1 space-y-4 text-center md:text-left">
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                                                <h3 className="text-text-primary group-hover:text-accent text-3xl font-black tracking-tight transition-colors">
                                                    {session.problemIds?.[0]?.title ||
                                                        'Session Analysis'}
                                                </h3>
                                                <span
                                                    className={`rounded-full border px-3 py-1 text-[9px] font-black tracking-widest uppercase ${
                                                        session.status === 'completed'
                                                            ? 'border-accent/20 bg-accent/10 text-accent'
                                                            : session.status === 'terminated'
                                                              ? 'border-error/20 bg-error/10 text-error'
                                                              : session.status === 'expired'
                                                                ? 'border-warning/20 bg-warning/10 text-warning'
                                                                : 'border-text-secondary/20 bg-text-secondary/10 text-text-secondary'
                                                    }`}
                                                >
                                                    {session.status}
                                                </span>
                                            </div>
                                            <div className="text-text-muted flex flex-wrap items-center justify-center gap-4 text-xs font-bold tracking-wide uppercase md:justify-start">
                                                <div className="hover:text-text-secondary flex items-center gap-1.5 transition-colors">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {format(
                                                        new Date(session.startedAt || Date.now()),
                                                        'MMM d, yyyy'
                                                    )}
                                                </div>
                                                <div className="bg-border h-1 w-1 rounded-full" />
                                                <div className="hover:text-text-secondary flex items-center gap-1.5 transition-colors">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {format(
                                                        new Date(session.startedAt || Date.now()),
                                                        'h:mm a'
                                                    )}
                                                </div>
                                                <div className="bg-border h-1 w-1 rounded-full" />
                                                <div className="text-accent flex items-center gap-1.5">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                                    {session.mode || 'Practice'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Score Display */}
                                    {session.status === 'completed' &&
                                        session.finalScore !== undefined && (
                                            <div className="bg-bg-page/40 border-border flex flex-col items-center rounded-3xl border p-4 shadow-inner md:items-end">
                                                <span className="text-text-muted mb-1 text-[10px] font-black tracking-[0.3em] uppercase">
                                                    Final Score
                                                </span>
                                                <div className="flex items-baseline gap-1">
                                                    <span
                                                        className={`text-4xl leading-none font-[1000] ${
                                                            session.finalScore >= 70
                                                                ? 'text-accent'
                                                                : 'text-text-primary'
                                                        }`}
                                                    >
                                                        {session.finalScore}
                                                    </span>
                                                    <span className="text-text-muted text-base font-bold">
                                                        /100
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                    {/* Action Buttons */}
                                    <div className="flex w-full flex-shrink-0 flex-col gap-3 sm:flex-row md:w-auto">
                                        <Link
                                            href={`/interview/${session._id}${session.status === 'active' ? '' : '/replay'}`}
                                            className="w-full"
                                        >
                                            <Button
                                                variant="ghost"
                                                className="bg-bg-muted/50 hover:bg-bg-muted text-text-primary h-12 w-full rounded-xl text-xs font-black tracking-widest uppercase transition-all md:px-6"
                                            >
                                                {session.status === 'active' ? (
                                                    <Sparkles className="text-accent mr-2 h-4 w-4" />
                                                ) : (
                                                    <PlayCircle className="text-accent mr-2 h-4 w-4" />
                                                )}
                                                {session.status === 'active'
                                                    ? 'Resume'
                                                    : 'View Replay'}
                                            </Button>
                                        </Link>
                                        <Link
                                            href={`/interview/${session._id}/${session.status === 'active' ? '' : 'result'}`}
                                            className="w-full"
                                        >
                                            <Button
                                                className={`h-12 w-full rounded-xl text-xs font-black tracking-widest uppercase transition-all md:px-8 ${
                                                    session.status === 'active'
                                                        ? 'bg-accent hover:bg-accent-hover text-black'
                                                        : 'hover:bg-accent bg-white text-black'
                                                } hover:shadow-accent/20 shadow-lg`}
                                            >
                                                {session.status === 'active'
                                                    ? 'Join Now'
                                                    : 'View Result'}
                                                <ChevronRight className="ml-2 h-4 w-4" />
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
