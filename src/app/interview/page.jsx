'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Shield, BarChart3, Bot, Code, Mic, Play, MessageSquare, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import HeroWithPixelBackground from '@/components/hero-with-pixelbackground'

// Shared Compact Feature Card for high-density layouts
const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="group bg-bg-subtle border-border hover:border-accent/40 relative flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
        <div className="bg-bg-muted border-border group-hover:border-accent/20 mb-6 flex h-12 w-12 items-center justify-center rounded-xl border shadow-sm transition-all duration-300 group-hover:scale-110">
            <Icon className="text-accent h-6 w-6" />
        </div>
        <h3 className="text-text-primary mb-3 text-lg font-bold tracking-tight">{title}</h3>
        <p className="text-text-secondary text-sm leading-relaxed font-medium opacity-80">
            {description}
        </p>
    </motion.div>
)

// Compact Protocol Card for Bento Grid
const ProtocolCard = ({ number, title, description, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        className="bg-bg-subtle border-border hover:border-accent/30 flex flex-col justify-between rounded-3xl border p-8 transition-all duration-300"
    >
        <div className="space-y-4">
            <div className="bg-accent/10 border-accent/20 text-accent inline-flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold">
                {number}
            </div>
            <h3 className="text-text-primary text-xl font-bold tracking-tight">{title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed font-medium opacity-80">
                {description}
            </p>
        </div>
    </motion.div>
)

export default function InterviewLandingPage() {
    return (
        <main className="bg-bg-page text-rendering-optimize min-h-screen">
            {/* Master Hero: Non-Animated/Static High-Fidelity */}
            <HeroWithPixelBackground
                badge="Premium Technical Simulation"
                title={
                    <>
                        Interviewing,{' '}
                        <span className="text-accent font-normal italic">Reimagined.</span>
                    </>
                }
                subtitle="Practice DSA and architectural problems in a live, stress-tested environment with Alex—your AI career coach."
                primary={{ label: 'Launch training', href: '/interview/new' }}
                secondary={{ label: 'View History', href: '/interview/history' }}
            />

            {/* Performance Features Section - High Density */}
            <section className="container mx-auto max-w-7xl px-6 py-24">
                <div className="mb-16 space-y-4">
                    <div className="text-accent text-[10px] font-bold tracking-[0.3em] uppercase">
                        Scalable Architecture
                    </div>
                    <h2 className="text-text-primary text-4xl font-black tracking-tight md:text-6xl">
                        Built for Performance.
                    </h2>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <FeatureCard
                        icon={Bot}
                        title="Adaptive AI"
                        description="Alex adjusts difficulty and hints based on your real-time performance."
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={Code}
                        title="Production Sandbox"
                        description="A secure environment to run code in 15+ languages with real-time test output."
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={BarChart3}
                        title="Deep Evaluation"
                        description="Post-session reports covering complexity, clean code, and clarity."
                        delay={0.3}
                    />
                    <FeatureCard
                        icon={Shield}
                        title="Stress Simulation"
                        description="Experience Big Tech pressure with time-limits and live follow-up questions."
                        delay={0.4}
                    />
                    <FeatureCard
                        icon={Play}
                        title="Session Replays"
                        description="Review every message and code change to identify improvement areas."
                        delay={0.5}
                    />
                    <FeatureCard
                        icon={Mic}
                        title="Voice & Audio"
                        description="Low-latency audio interaction for a truly immersive experience."
                        delay={0.6}
                    />
                </div>
            </section>

            {/* The Protocol Section - Compact Bento Grid */}
            <section className="bg-bg-subtle/30 border-border border-y px-6 py-24">
                <div className="container mx-auto max-w-7xl">
                    <div className="mb-20 space-y-4 text-center">
                        <div className="bg-accent/10 border-accent/20 text-accent inline-block rounded-full border px-4 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase">
                            The Protocol
                        </div>
                        <h2 className="text-text-primary text-5xl leading-tight font-black tracking-tight md:text-7xl">
                            Mastery through Repetition.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <ProtocolCard
                            number="01"
                            title="Pick Your Focus"
                            description="Select from curated problems or let Alex generate a unique scenario."
                            delay={0.1}
                        />
                        <ProtocolCard
                            number="02"
                            title="Face the AI"
                            description="Alex introduces the problem and probes your architectural decisions."
                            delay={0.2}
                        />
                        <ProtocolCard
                            number="03"
                            title="Code & Communicate"
                            description="Solve in our editor while explaining your logic via chat or audio."
                            delay={0.3}
                        />
                        <ProtocolCard
                            number="04"
                            title="Expert Analysis"
                            description="Receive a scorecard with feedback normally reserved for hiring committees."
                            delay={0.4}
                        />
                    </div>
                </div>
            </section>

            {/* Final Conversion & Insights Section - Balanced Side-by-Side */}
            <section className="bg-bg-page border-border relative overflow-hidden border-b py-32">
                <div className="container mx-auto max-w-6xl px-6">
                    <div className="flex flex-col items-center justify-between gap-16 lg:flex-row">
                        {/* Left Column: CTA Content */}
                        <div className="w-full space-y-10 text-center lg:w-[55%] lg:text-left">
                            <div className="space-y-6">
                                <h2 className="text-text-primary text-5xl leading-[1.1] font-black tracking-tight md:text-7xl">
                                    Your Dream Offer is <br />
                                    <span className="text-accent underline decoration-2 underline-offset-8">
                                        One Session Away.
                                    </span>
                                </h2>
                                <p className="text-text-secondary max-w-2xl text-lg leading-relaxed font-medium opacity-90 md:text-xl">
                                    Stop guessing. Our AI-driven evaluations provide the precision
                                    feedback needed to break through into Big Tech.
                                </p>
                            </div>

                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                                <Link href="/interview/new">
                                    <Button className="bg-accent hover:bg-accent-hover hover:shadow-accent/20 h-14 min-w-[240px] rounded-md px-10 text-sm font-bold tracking-widest text-white uppercase shadow-lg transition-all duration-300">
                                        Launch training
                                    </Button>
                                </Link>
                                <Link href="/interview/history">
                                    <Button
                                        variant="outline"
                                        className="border-border text-text-primary hover:border-text-primary h-14 min-w-[240px] rounded-md bg-white px-10 text-sm font-bold tracking-widest uppercase shadow-sm transition-all hover:bg-white hover:text-black"
                                    >
                                        View History
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Right Column: Growth Track Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="w-full max-w-xl lg:w-[40%]"
                        >
                            <div className="bg-bg-subtle border-border relative overflow-hidden rounded-2xl border p-8 text-left shadow-sm">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                                    <Zap className="h-64 w-64" />
                                </div>

                                <div className="relative z-10">
                                    <div className="mb-10 flex items-center justify-between">
                                        <div className="space-y-1.5">
                                            <h4 className="text-text-primary text-2xl font-bold tracking-tight">
                                                Growth Track
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <span className="bg-accent h-1.5 w-1.5 animate-pulse rounded-full" />
                                                <p className="text-text-muted text-[10px] font-bold tracking-widest uppercase">
                                                    Global Benchmarking active
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        {[
                                            {
                                                label: 'Technical Comm.',
                                                score: 88,
                                                icon: MessageSquare,
                                            },
                                            { label: 'Problem Solving', score: 94, icon: Zap },
                                            { label: 'Architecture', score: 82, icon: Shield },
                                        ].map((stat, i) => (
                                            <div key={i} className="space-y-4">
                                                <div className="flex items-end justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <stat.icon className="text-accent h-4 w-4" />
                                                        <span className="text-text-secondary text-xs font-bold tracking-wider uppercase">
                                                            {stat.label}
                                                        </span>
                                                    </div>
                                                    <div className="text-text-primary text-xl font-bold">
                                                        {stat.score}%
                                                    </div>
                                                </div>
                                                <div className="bg-bg-muted relative h-1.5 w-full overflow-hidden rounded-full">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${stat.score}%` }}
                                                        transition={{
                                                            duration: 1.5,
                                                            delay: 0.4 + i * 0.15,
                                                        }}
                                                        className="bg-accent absolute inset-0 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-border/50 mt-12 flex items-center gap-4 border-t pt-8">
                                        <div className="bg-accent/10 border-accent/20 rounded-xl border p-3">
                                            <Trophy className="text-accent h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="text-text-primary text-sm font-bold uppercase">
                                                Top 5% Global Tier
                                            </div>
                                            <div className="text-text-muted text-xs font-medium">
                                                Ready for Senior Staff probes
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <footer className="bg-bg-page border-border border-t py-12 text-center">
                <p className="text-text-muted text-[10px] font-bold tracking-[0.4em] uppercase">
                    CodeArena AI • Powering the Next Generation of Engineers
                </p>
            </footer>
        </main>
    )
}
