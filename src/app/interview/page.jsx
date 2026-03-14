'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Shield, Target, BarChart3, ArrowRight, Sparkles, Bot, Code, Mic } from 'lucide-react'
import HistoryList from '@/features/interview/HistoryList'
import { Button } from '@/components/ui/button'

const BentoCard = ({ icon: Icon, title, description, className = '', delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={`group border-border bg-bg-subtle/50 hover:bg-bg-subtle/80 relative overflow-hidden rounded-[2rem] border p-8 transition-all duration-500 ${className}`}
    >
        <div className="bg-accent/5 absolute -inset-24 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100" />
        <div className="relative z-10">
            <div className="bg-bg-page border-border group-hover:border-accent/50 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border shadow-inner transition-colors duration-500">
                <Icon className="text-accent h-7 w-7 transition-transform duration-500 group-hover:scale-110" />
            </div>
            <h3 className="text-text-primary mb-3 text-xl font-bold tracking-tight">{title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed font-medium">{description}</p>
        </div>
    </motion.div>
)

export default function InterviewLandingPage() {
    return (
        <main className="bg-bg-page selection:bg-accent/30 min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-32 pb-20">
                <div className="from-accent/5 pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b via-transparent to-transparent" />

                <div className="relative container mx-auto max-w-7xl px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="border-accent/20 bg-accent/10 text-accent mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black tracking-widest uppercase"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        AI-Powered Technical Coaching
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-text-primary mb-8 text-6xl font-[1000] tracking-tight md:text-8xl lg:text-9xl"
                    >
                        Master the <br />
                        <span className="text-accent font-serif italic">Interview.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-text-secondary mx-auto mb-12 max-w-2xl text-xl leading-relaxed font-medium md:text-2xl"
                    >
                        Practice data structures and algorithms in a live, high-pressure 1:1
                        environment with Alex, our senior AI interviewer.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                    >
                        <Link href="/interview/new">
                            <Button
                                size="lg"
                                className="bg-accent shadow-accent/20 hover:bg-accent-hover h-16 rounded-[1.2rem] px-12 text-lg font-black text-black shadow-2xl transition-all hover:scale-105"
                            >
                                Start Session
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/interview/case-studies">
                            <Button
                                variant="ghost"
                                className="border-border bg-bg-subtle/50 text-text-primary hover:bg-bg-subtle h-16 rounded-[1.2rem] border px-8 text-lg font-bold transition-all"
                            >
                                View Case Studies
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Features Bento Grid */}
            <section className="container mx-auto max-w-7xl px-4 py-12">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
                    <BentoCard
                        icon={Bot}
                        title="Adaptive AI"
                        description="Alex adjusts the difficulty and hints based on your real-time performance."
                        className="md:col-span-2"
                        delay={0.4}
                    />
                    <BentoCard
                        icon={Code}
                        title="Live Execution"
                        description="Secure, isolated environment to run and test your code in 10+ languages."
                        delay={0.5}
                    />
                    <BentoCard
                        icon={BarChart3}
                        title="Deep Analysis"
                        description="Receive architectural feedback and Big O complexity analysis post-session."
                        delay={0.6}
                    />
                    <BentoCard
                        icon={Target}
                        title="Vibe Check"
                        description="Our AI evaluates your technical communication and problem-solving clarity."
                        delay={0.7}
                    />
                    <BentoCard
                        icon={Mic}
                        title="Voice Mode"
                        description="Optional real-time audio interaction for a truly immersive experience."
                        delay={0.8}
                    />
                    <BentoCard
                        icon={Shield}
                        title="Stress Tested"
                        description="Practicing under pressure builds the muscle memory needed for Big Tech interviews."
                        className="md:col-span-2"
                        delay={0.9}
                    />
                </div>
            </section>

            {/* History Section */}
            <section className="border-border bg-bg-subtle/30 relative mt-20 border-t py-12 backdrop-blur-3xl">
                <div className="via-accent/30 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />
                <div className="bg-grid-white/[0.02] pointer-events-none absolute inset-0" />
                <HistoryList />
            </section>
        </main>
    )
}
