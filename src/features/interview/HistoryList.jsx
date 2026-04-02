'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar,
    ChevronRight,
    Clock,
    Trophy,
    Gamepad2,
    CheckCircle2,
    AlertCircle,
    Brain,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

const listVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1,
        },
    },
}

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 10,
        filter: 'blur(4px)',
    },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
        },
    },
}

// ── Session State Helpers (must match backend) ─────────────────────────────────
const RESUMABLE_STATUSES = ['active', 'paused']
const TERMINAL_STATUSES = ['completed', 'terminated', 'expired']
const isResumable = (status) => RESUMABLE_STATUSES.includes(status)
const hasReport = (status) => TERMINAL_STATUSES.includes(status)

const STATUS_STYLES = {
    completed: {
        icon: CheckCircle2,
        className: 'bg-accent/5 border-accent/20 text-accent shadow-[0_0_8px_rgba(2,186,76,0.08)]',
    },
    active: {
        icon: AlertCircle,
        className:
            'border-blue-500/20 bg-blue-500/5 text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.08)]',
    },
    paused: {
        icon: AlertCircle,
        className:
            'border-yellow-500/20 bg-yellow-500/5 text-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.08)]',
    },
    terminated: {
        icon: AlertCircle,
        className:
            'border-red-500/20 bg-red-500/5 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.08)]',
    },
    expired: {
        icon: AlertCircle,
        className:
            'border-orange-500/20 bg-orange-500/5 text-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.08)]',
    },
}

const StatusPill = ({ status }) => {
    const normalizedStatus = status?.toLowerCase() || 'unknown'
    const config = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.expired
    const Icon = config.icon
    return (
        <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-medium tracking-widest uppercase transition-all duration-300 ${config.className}`}
        >
            <Icon className="h-2.5 w-2.5" />
            {status || 'Unknown'}
        </div>
    )
}

const SessionSkeleton = () => (
    <div className="border-border bg-bg-subtle/30 animate-pulse space-y-4 rounded-xl border p-5">
        <div className="flex items-center justify-between">
            <div className="bg-bg-muted h-8 w-32 rounded-lg" />
            <div className="bg-bg-muted h-5 w-20 rounded-full" />
        </div>
        <div className="bg-bg-muted h-3 w-2/3 rounded" />
        <div className="flex gap-3 pt-2">
            <div className="bg-bg-muted h-8 w-24 rounded-lg" />
            <div className="bg-bg-muted h-8 w-24 rounded-lg" />
        </div>
    </div>
)

export default function HistoryList() {
    const router = useRouter()
    const [sessions, setSessions] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/interview/sessions')
                const data = await res.json()
                if (data.success) {
                    setSessions(data.data || [])
                }
            } catch (err) {
                console.error('Failed to fetch interview history:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchHistory()
    }, [])

    if (isLoading) {
        return (
            <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                    <SessionSkeleton key={i} />
                ))}
            </div>
        )
    }

    if (!sessions || sessions.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-bg-subtle/50 border-border flex flex-col items-center justify-center rounded-2xl border border-dashed py-24 text-center"
            >
                <div className="bg-bg-page border-border mb-5 flex h-16 w-16 items-center justify-center rounded-xl border shadow-lg">
                    <Brain className="text-text-muted h-8 w-8" />
                </div>
                <h3 className="text-text-primary mb-1 text-xl font-bold italic">
                    No Records Found
                </h3>
                <p className="text-text-muted mb-6 max-w-sm text-xs font-medium opacity-50">
                    Your simulation history is empty. Unlock analytics after your first session.
                </p>
                <Button
                    onClick={() => router.push('/interview/new')}
                    className="bg-accent hover:bg-accent-hover rounded-lg px-6 text-[10px] tracking-widest text-black uppercase shadow-md transition-all hover:scale-105"
                >
                    Start First Session
                </Button>
            </motion.div>
        )
    }

    return (
        <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4"
        >
            <AnimatePresence>
                {sessions.map((session) => (
                    <motion.div
                        key={session._id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.005, y: -1 }}
                        className="group border-border bg-bg-subtle/30 hover:bg-bg-subtle hover:border-accent/20 relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all duration-300 hover:shadow-lg"
                    >
                        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                            {/* Left: Metadata */}
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-xl border shadow-inner transition-all duration-300 group-hover:rotate-3 ${
                                            session.mode === 'mock'
                                                ? 'bg-accent/5 border-accent/20 text-accent'
                                                : 'bg-bg-page border-border text-text-muted group-hover:text-text-primary'
                                        }`}
                                    >
                                        {session.mode === 'mock' ? (
                                            <Trophy className="h-4.5 w-4.5" />
                                        ) : (
                                            <Gamepad2 className="h-4.5 w-4.5" />
                                        )}
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="text-text-primary group-hover:text-accent text-lg font-bold tracking-tight transition-colors">
                                            {session.mode === 'mock'
                                                ? 'Mock Interview'
                                                : 'Practice Session'}
                                        </h3>
                                        <div className="flex items-center gap-1.5 opacity-50">
                                            <Calendar className="h-2.5 w-2.5" />
                                            <span className="text-[9px] font-medium tracking-widest uppercase">
                                                {format(
                                                    new Date(session.createdAt),
                                                    'MMM dd, yyyy • HH:mm'
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <div className="bg-bg-page border-border group-hover:border-accent/5 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 transition-colors">
                                        <Clock className="text-accent h-3 w-3" />
                                        <span className="text-text-secondary text-[9px] font-medium tracking-widest uppercase">
                                            {session.durationMins || 0} MINS
                                        </span>
                                    </div>
                                    <StatusPill status={session.status} />
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="border-border/40 flex items-center justify-end border-t pt-4 md:border-none md:pt-0">
                                <Button
                                    onClick={() => {
                                        if (isResumable(session.status)) {
                                            router.push(`/interview/${session._id}`)
                                        } else if (hasReport(session.status)) {
                                            router.push(`/interview/${session._id}/result`)
                                        }
                                    }}
                                    variant="ghost"
                                    className="border-border hover:bg-accent group/btn text-text-primary h-11 rounded-xl border px-6 text-[9px] tracking-[0.3em] uppercase transition-all duration-300 hover:scale-105 hover:text-black active:scale-95"
                                >
                                    {isResumable(session.status) ? 'RESUME' : 'VIEW REPORT'}
                                    <ChevronRight className="ml-1.5 h-3 w-3 transition-transform duration-300 group-hover/btn:translate-x-1" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            <div className="mt-8 text-center opacity-30">
                <p className="text-text-muted text-[8px] font-medium tracking-[0.5em] uppercase">
                    End of Simulation Logs
                </p>
            </div>
        </motion.div>
    )
}
