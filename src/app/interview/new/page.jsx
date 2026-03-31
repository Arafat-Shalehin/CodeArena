'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Clock, ChevronRight, Sparkles, Brain, Trophy, Gamepad2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tiles } from '@/components/ui/tiles'
import { toast } from 'sonner'
import Link from 'next/link'

const MODES = [
    {
        id: 'coding',
        title: 'Practice Session',
        description: 'Guided problem-solving. Alex will provide hints and feedback.',
        icon: Gamepad2,
    },
    {
        id: 'mock',
        title: 'Mock Interview',
        description: 'Elite pressure. No hints, strict timing, and objective scoring.',
        icon: Trophy,
    },
]

const DURATIONS = [1, 5, 30, 45, 60]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 15, filter: 'blur(6px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
}

export default function NewInterviewPage() {
    const router = useRouter()
    const [mode, setMode] = useState('coding')
    const [duration, setDuration] = useState(45)
    const [isCreating, setIsCreating] = useState(false)

    const handleStart = async () => {
        setIsCreating(true)
        try {
            const res = await fetch('/api/interview/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode, durationMins: duration }),
            })

            const data = await res.json()

            if (res.ok && data.sessionId) {
                toast.success('Interview session created!')
                router.push(`/interview/${data.sessionId}`)
            } else {
                if (data.error === 'ACTIVE_SESSION_EXISTS' && data.sessionId) {
                    toast.error('You already have an active session.', {
                        action: {
                            label: 'Resume',
                            onClick: () => router.push(`/interview/${data.sessionId}`),
                        },
                    })
                } else {
                    throw new Error(data.message || 'Failed to start interview')
                }
            }
        } catch (error) {
            console.error('Start Interview Error:', error)
            toast.error(error.message)
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <main className="bg-bg-page selection:bg-accent/30 relative flex min-h-screen flex-col items-center overflow-hidden">
            {/* Master Static Spotlight + Tiles */}
            <div className="absolute inset-0 z-0">
                <Tiles
                    className="opacity-[0.05] lg:opacity-[0.07]"
                    rows={30}
                    cols={28}
                    tileSize="md"
                    tileClassName="border-neutral-300 dark:border-neutral-800/10"
                />
                <div
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,186,76,0.012)_0%,transparent_70%)]"
                    aria-hidden="true"
                />
            </div>

            <div className="relative z-10 container mx-auto max-w-4xl px-6 pt-4 pb-16">
                <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link
                        href="/interview"
                        className="text-text-muted hover:text-accent mb-2 inline-flex items-center gap-2 text-[9px] font-black tracking-[0.4em] uppercase transition-colors"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Dashboard
                    </Link>
                </motion.div>

                <header className="mb-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-text-primary mb-2 text-4xl leading-none font-[1000] tracking-tighter md:text-6xl"
                    >
                        Ready to{' '}
                        <span className="text-accent font-normal tracking-tight italic">
                            Begin?
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-text-secondary text-sm font-medium opacity-50"
                    >
                        Configure parameters. Alex is ready when you are.
                    </motion.p>
                </header>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-8"
                >
                    {/* Mode Selection */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <div className="text-text-muted flex items-center gap-2.5 text-[9px] font-black tracking-[0.4em] uppercase opacity-50">
                            <Brain className="text-accent h-3.5 w-3.5" />
                            Select Mode
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {MODES.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setMode(item.id)}
                                    className={`group relative flex flex-col items-start rounded-2xl border p-6 text-left transition-all duration-300 ${
                                        mode === item.id
                                            ? 'border-accent/30 bg-accent/5 ring-accent/10 shadow-lg ring-1'
                                            : 'border-border bg-bg-subtle/50 hover:bg-bg-subtle hover:border-accent/10'
                                    }`}
                                >
                                    <div
                                        className={`mb-4 rounded-xl p-3 transition-all duration-300 ${
                                            mode === item.id
                                                ? 'bg-accent/10 border-accent/20 border'
                                                : 'bg-bg-page border-border border group-hover:scale-105'
                                        }`}
                                    >
                                        <item.icon
                                            className={`h-5 w-5 transition-colors duration-300 ${mode === item.id ? 'text-accent' : 'text-text-muted'}`}
                                        />
                                    </div>
                                    <h3 className="text-text-primary mb-1 text-xl font-black">
                                        {item.title}
                                    </h3>
                                    <p className="text-text-secondary text-xs leading-relaxed font-semibold opacity-60">
                                        {item.description}
                                    </p>
                                    {mode === item.id && (
                                        <div className="bg-accent absolute top-5 right-5 flex h-1 w-1 items-center justify-center rounded-full shadow-[0_0_10px_rgba(2,186,76,0.6)]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Duration Selection */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <div className="text-text-muted flex items-center gap-2.5 text-[9px] font-black tracking-[0.4em] uppercase opacity-50">
                            <Clock className="text-accent h-3.5 w-3.5" />
                            Duration
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            {DURATIONS.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDuration(d)}
                                    className={`rounded-xl px-6 py-3 text-[10px] font-black transition-all duration-300 active:scale-95 ${
                                        duration === d
                                            ? 'bg-accent shadow-accent/10 scale-105 text-black shadow-md'
                                            : 'bg-bg-subtle/50 border-border text-text-muted hover:text-text-primary hover:border-accent/10 border'
                                    }`}
                                >
                                    {d} MINS
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Final Action */}
                    <motion.div variants={itemVariants} className="border-border border-t pt-8">
                        <div className="bg-bg-subtle/50 border-border hover:border-accent/5 flex flex-col justify-between gap-6 rounded-2xl border p-6 shadow-md transition-colors duration-300 md:flex-row md:items-center">
                            <div className="space-y-0.5">
                                <h4 className="text-text-primary text-xl font-black">
                                    Finalize Session
                                </h4>
                                <p className="text-text-muted text-[8px] font-black tracking-[0.4em] uppercase opacity-50">
                                    {duration} mins •{' '}
                                    {mode === 'coding' ? 'Practice' : 'Ranked Session'}
                                </p>
                            </div>
                            <Button
                                size="lg"
                                onClick={handleStart}
                                disabled={isCreating}
                                className="bg-accent hover:bg-accent-hover shadow-accent/10 h-13 rounded-xl px-10 text-xs font-black tracking-widest text-black shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
                            >
                                {isCreating ? 'SYNCING...' : 'ENTER SANDBOX'}
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </main>
    )
}
