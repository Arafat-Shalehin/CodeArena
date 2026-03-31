'use client'

import HistoryList from '@/features/interview/HistoryList'
import { Sparkles, Calendar, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function InterviewHistoryPage() {
    return (
        <main className="bg-bg-page selection:bg-accent/30 relative min-h-screen overflow-hidden pb-20">
            {/* Static Radial Spotlight (No Animation) */}
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,186,76,0.015)_0%,transparent_70%)]"
                aria-hidden="true"
            />

            <div className="relative pt-3 pb-4">
                <div className="relative z-10 container mx-auto max-w-6xl px-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8 flex justify-center md:justify-start"
                    >
                        <Link
                            href="/interview"
                            className="text-text-muted hover:text-accent inline-flex items-center gap-2 text-[10px] font-black tracking-[0.3em] uppercase transition-colors"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            Back to Dashboard
                        </Link>
                    </motion.div>

                    <div className="flex flex-col items-center gap-4 text-center">
                        <header className="space-y-4">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                className="text-text-primary text-6xl leading-[1.0] font-black tracking-tighter md:text-7xl"
                            >
                                Session{' '}
                                <span className="text-accent font-normal italic">History.</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-text-secondary mx-auto mt-2 max-w-xl text-sm leading-relaxed font-medium opacity-80"
                            >
                                Track your progress, review detailed evaluations, and watch session
                                replays to improve your interview performance.
                            </motion.p>
                        </header>
                    </div>
                </div>
            </div>

            <div className="relative z-10 container mx-auto max-w-6xl px-6">
                <HistoryList />
            </div>
        </main>
    )
}
