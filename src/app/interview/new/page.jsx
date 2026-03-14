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
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
    },
    {
        id: 'mock',
        title: 'Mock Interview',
        description: 'Elite pressure. No hints, strict timing, and objective scoring.',
        icon: Trophy,
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
    },
]

const DURATIONS = [1, 30, 45, 60]

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
        <main className="bg-bg-page min-h-screen px-4 pt-32 pb-20">
            <div className="container mx-auto max-w-4xl">
                <Link
                    href="/interview"
                    className="text-text-secondary hover:text-accent mb-12 inline-flex items-center gap-2 font-bold transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>

                <header className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="border-accent/20 bg-accent/10 text-accent mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black tracking-widest uppercase"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Session Configuration
                    </motion.div>
                    <h1 className="text-text-primary mb-4 text-5xl font-[1000] tracking-tight">
                        Ready to <span className="text-accent font-serif italic">Begin?</span>
                    </h1>
                    <p className="text-text-secondary text-xl font-medium">
                        Configure your simulation parameters. Alex is ready when you are.
                    </p>
                </header>

                <div className="grid gap-12">
                    {/* Mode Selection */}
                    <div className="space-y-6">
                        <div className="text-text-primary flex items-center gap-3 text-xs font-black tracking-widest uppercase">
                            <Brain className="text-accent h-4 w-4" />
                            Select Simulation Mode
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {MODES.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setMode(item.id)}
                                    className={`relative flex flex-col items-start rounded-[2rem] border p-8 text-left transition-all duration-300 ${
                                        mode === item.id
                                            ? 'border-accent bg-accent/5 ring-accent ring-1'
                                            : 'border-border bg-bg-subtle/50 hover:bg-bg-subtle hover:border-text-muted'
                                    }`}
                                >
                                    <div className={`mb-6 rounded-2xl p-4 ${item.bg}`}>
                                        <item.icon className={`h-6 w-6 ${item.color}`} />
                                    </div>
                                    <h3 className="text-text-primary mb-2 text-xl font-bold">
                                        {item.title}
                                    </h3>
                                    <p className="text-text-secondary text-sm leading-relaxed font-medium">
                                        {item.description}
                                    </p>
                                    {mode === item.id && (
                                        <div className="bg-accent absolute top-6 right-6 flex h-6 w-6 items-center justify-center rounded-full">
                                            <div className="h-3 w-3 rounded-full bg-black" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration Selection */}
                    <div className="space-y-6">
                        <div className="text-text-primary flex items-center gap-3 text-xs font-black tracking-widest uppercase">
                            <Clock className="text-accent h-4 w-4" />
                            Session Duration
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {DURATIONS.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDuration(d)}
                                    className={`rounded-2xl px-8 py-4 font-bold transition-all ${
                                        duration === d
                                            ? 'bg-accent shadow-accent/20 text-black shadow-lg'
                                            : 'bg-bg-subtle border-border text-text-secondary hover:text-text-primary hover:border-text-muted border'
                                    }`}
                                >
                                    {d} Minutes
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Final Action */}
                    <div className="border-border border-t pt-12">
                        <div className="bg-bg-subtle/50 border-border flex flex-col justify-between gap-8 rounded-[2rem] border p-8 md:flex-row md:items-center">
                            <div className="space-y-1">
                                <h4 className="text-text-primary text-lg font-bold">All set?</h4>
                                <p className="text-text-secondary text-sm font-medium">
                                    Total Session: {duration} mins •{' '}
                                    {mode === 'coding' ? 'Practice' : 'Ranked'}
                                </p>
                            </div>
                            <Button
                                size="lg"
                                onClick={handleStart}
                                disabled={isCreating}
                                className="bg-accent shadow-accent/20 hover:bg-accent-hover h-16 rounded-[1.2rem] px-12 text-lg font-black text-black shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                            >
                                {isCreating ? 'Synchronizing...' : 'Enter Sandbox'}
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
