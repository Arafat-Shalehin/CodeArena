'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Zap,
    Target,
    Clock,
    ChevronRight,
    Sparkles,
    Brain,
    Trophy,
    Gamepad2,
    ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'

const MODES = [
    {
        id: 'coding',
        title: 'Practice Session',
        description: 'Guided problem solving. Alex will help you with hints and feedback.',
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
        <main className="bg-bg-page selection:bg-accent/30 relative min-h-screen overflow-hidden px-6 pt-2 pb-10">
            {/* Static Radial Spotlight (No Animation) */}
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,186,76,0.02)_0%,transparent_70%)]"
                aria-hidden="true"
            />

            <div className="relative z-10 container mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Link
                        href="/interview"
                        className="text-text-sub-muted hover:text-accent mb-2 inline-flex items-center gap-2 text-[10px] font-black tracking-[0.3em] uppercase transition-colors"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Back to Dashboard
                    </Link>
                </motion.div>

                <header className="mb-2">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-text-primary mb-2 text-6xl leading-[1.0] font-black tracking-tighter sm:text-7xl"
                    >
                        Ready to <span className="text-accent font-normal italic">Begin?</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-text-secondary pb-4 text-lg font-medium opacity-80"
                    >
                        Configure your simulation parameters. Alex is ready when you are.
                    </motion.p>
                </header>

                <div className="grid gap-8">
                    {/* Mode Selection */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {MODES.map((item, idx) => (
                                <button
                                    key={item.id}
                                    onClick={() => setMode(item.id)}
                                    className={`group relative flex flex-col items-start rounded-2xl border p-6 text-left transition-all duration-300 ${
                                        mode === item.id
                                            ? 'border-accent bg-accent/[0.02] shadow-sm'
                                            : 'border-border bg-bg-subtle/40 hover:bg-bg-subtle hover:border-text-muted/30'
                                    }`}
                                >
                                    <div
                                        className={`border-border group-hover:border-accent/20 bg-bg-page mb-6 flex h-12 w-12 items-center justify-center rounded-xl border shadow-sm transition-all duration-300 ${mode === item.id ? 'border-accent/40 scale-110' : ''}`}
                                    >
                                        <item.icon
                                            className={`h-5 w-5 ${mode === item.id ? 'text-accent' : 'text-text-muted'}`}
                                        />
                                    </div>
                                    <h3
                                        className={`mb-2 text-lg font-bold tracking-tight transition-colors ${mode === item.id ? 'text-text-primary' : 'text-text-primary/70'}`}
                                    >
                                        {item.title}
                                    </h3>
                                    <p className="text-text-secondary text-xs leading-relaxed font-medium opacity-70">
                                        {item.description}
                                    </p>
                                    {mode === item.id && (
                                        <div className="bg-accent absolute top-6 right-6 flex h-5 w-5 items-center justify-center rounded-full shadow-[0_0_10px_rgba(2,186,76,0.3)]">
                                            <div className="h-2 w-2 rounded-full bg-black" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Duration Selection */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="space-y-8"
                    >
                        <div className="text-text-muted flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase">
                            <span className="bg-accent h-1.5 w-1.5 rounded-full" />
                            Session Duration
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {DURATIONS.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDuration(d)}
                                    className={`h-11 rounded-md px-8 text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                                        duration === d
                                            ? 'bg-accent shadow-accent/20 text-white shadow-lg'
                                            : 'bg-bg-subtle border-border text-text-muted hover:border-text-muted hover:text-text-primary border'
                                    }`}
                                >
                                    {d} Min
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Final Action - High Density Footer */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="border-border mt-2 border-t pt-2"
                    >
                        <div className="bg-bg-subtle/50 border-border flex flex-col items-center justify-between gap-8 rounded-2xl border p-8 md:flex-row">
                            <div className="space-y-2 text-center md:text-left">
                                <h4 className="text-text-primary text-xl font-bold tracking-tight">
                                    System Ready.
                                </h4>
                                <div className="flex items-center justify-center gap-3 md:justify-start">
                                    <div className="bg-accent h-1.5 w-1.5 animate-pulse rounded-full" />
                                    <p className="text-text-secondary text-xs font-medium tracking-widest uppercase opacity-70">
                                        Total Session:{' '}
                                        <span className="text-text-primary font-bold">
                                            {duration} mins
                                        </span>{' '}
                                        •{' '}
                                        <span className="text-text-primary font-bold">
                                            {mode === 'coding' ? 'Practice' : 'Mock'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <Button
                                size="lg"
                                onClick={handleStart}
                                disabled={isCreating}
                                className="bg-accent hover:bg-accent-hover hover:shadow-accent/20 h-14 min-w-[220px] rounded-md px-10 text-sm font-bold tracking-[0.2em] text-white uppercase shadow-lg transition-all duration-300 disabled:opacity-50"
                            >
                                {isCreating ? 'Synchronizing...' : 'Enter Sandbox'}
                                {!isCreating && <ChevronRight className="ml-3 h-4 w-4" />}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    )
}
