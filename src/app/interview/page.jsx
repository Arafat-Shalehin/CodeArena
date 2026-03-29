'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import {
    Zap,
    Shield,
    Target,
    BarChart3,
    ArrowRight,
    Sparkles,
    Bot,
    Code,
    Mic,
    Search,
    Play,
    CheckCircle2,
    MessageSquare,
    Trophy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const MeshGradient = () => (
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1000px] overflow-hidden">
        <div className="bg-accent/20 animate-mesh absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
        <div className="animate-mesh absolute top-[20%] right-[-5%] h-[35%] w-[35%] rounded-full bg-blue-500/10 blur-[120px] [animation-delay:-5s]" />
        <div className="animate-mesh absolute bottom-[10%] left-[20%] h-[30%] w-[30%] rounded-full bg-purple-500/10 blur-[120px] [animation-delay:-10s]" />
    </div>
)

const FeatureCard = ({ icon: Icon, title, description, className = '', delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        className={`group border-border bg-bg-subtle/40 hover:bg-bg-subtle/80 hover:shadow-accent/5 relative overflow-hidden rounded-[2.5rem] border p-10 transition-all duration-700 hover:shadow-2xl ${className}`}
    >
        <div className="relative z-10">
            <div className="bg-bg-page border-border group-hover:border-accent/40 mb-8 flex h-16 w-16 items-center justify-center rounded-[1.5rem] border shadow-inner transition-all duration-700 group-hover:scale-110 group-hover:rotate-3">
                <Icon className="text-accent h-8 w-8 transition-transform duration-700 group-hover:scale-110" />
            </div>
            <h3 className="text-text-primary mb-4 text-2xl font-black tracking-tight">{title}</h3>
            <p className="text-text-secondary text-base leading-relaxed font-medium opacity-80 transition-opacity group-hover:opacity-100">
                {description}
            </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-0 transition-opacity duration-700 group-hover:opacity-10">
            <Icon size={120} className="translate-x-1/4 translate-y-1/4" />
        </div>
    </motion.div>
)

const HorizontalStep = ({ number, title, description, index }) => {
    const ref = useRef(null)
    const [hasFinished, setHasFinished] = React.useState(false)

    // Track scroll progress for this specific row
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start 1.0', 'end 0.8'],
    })

    const lineProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    })

    // Once progress hits 0.9, we consider it "finished" so content stays visible
    React.useEffect(() => {
        return scrollYProgress.on('change', (latest) => {
            if (latest > 0.9) setHasFinished(true)
        })
    }, [scrollYProgress])

    return (
        <div
            ref={ref}
            className="group relative flex flex-col items-center gap-6 py-12 md:flex-row md:gap-12 md:py-20"
        >
            {/* Step Box */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="bg-bg-subtle border-border group-hover:border-accent/40 relative flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] border shadow-xl transition-all duration-500 group-hover:scale-110 md:h-28 md:w-28 md:rounded-[2rem]"
            >
                <div className="bg-accent/5 absolute inset-0 rounded-[inherit] opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="text-accent relative z-10 text-3xl font-black md:text-5xl">
                    {number}
                </span>
            </motion.div>

            {/* Horizontal Progress Line */}
            <div className="bg-border/50 relative h-1.5 min-h-[40px] w-1 overflow-hidden rounded-full md:h-1 md:min-h-0 md:grow">
                <motion.div
                    style={{ scaleX: lineProgress }}
                    className="bg-accent h-full w-full origin-left shadow-[0_0_15px_rgba(var(--ca-accent-rgb),0.6)]"
                />
            </div>

            {/* Content Card */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={hasFinished ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="bg-bg-subtle border-border hover:border-accent/20 hover:shadow-accent/5 w-full rounded-[2rem] border p-8 shadow-2xl transition-all duration-500 md:w-[45%] md:p-10"
            >
                <div className="mb-4 flex items-center gap-3">
                    <div className="bg-accent/10 rounded-lg p-2">
                        <Sparkles className="text-accent h-5 w-5" />
                    </div>
                    <span className="text-accent text-xs font-black tracking-widest uppercase">
                        Phase {number}
                    </span>
                </div>
                <h3 className="text-text-primary mb-4 text-2xl font-[900] tracking-tight md:text-3xl">
                    {title}
                </h3>
                <p className="text-text-secondary text-base leading-relaxed font-medium opacity-90 md:text-lg">
                    {description}
                </p>
            </motion.div>
        </div>
    )
}

export default function InterviewLandingPage() {
    const journeyRef = useRef(null)

    return (
        <main className="bg-bg-page selection:bg-accent/30 text-rendering-optimize min-h-screen">
            <MeshGradient />

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-32">
                <div className="relative container mx-auto max-w-7xl px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="bg-accent/10 border-accent/20 text-accent mb-12 inline-flex items-center gap-3 rounded-full border px-6 py-2 text-xs font-black tracking-[0.2em] uppercase"
                    >
                        <Sparkles className="h-4 w-4 animate-pulse" />
                        Next-Gen Technical Interviewing
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-text-primary mb-10 text-7xl leading-[0.9] font-[1000] tracking-tighter md:text-9xl lg:text-[10rem]"
                    >
                        Interviewing, <br />
                        <span className="text-accent font-serif tracking-tight italic">
                            Reimagined.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-text-secondary mx-auto mb-16 max-w-3xl text-xl leading-relaxed font-medium opacity-90 md:text-2xl"
                    >
                        Practice DSA and architectural problems in a live, stress-tested environment
                        with Alex—your AI career coach.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex flex-col items-center justify-center gap-6 sm:flex-row"
                    >
                        <Link href="/interview/new">
                            <Button
                                size="lg"
                                className="bg-accent shadow-accent/40 hover:bg-accent-hover group h-20 rounded-[2rem] px-14 text-xl font-black text-black shadow-2xl transition-all hover:scale-105 active:scale-95"
                            >
                                Start New Session
                                <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                        <Link href="/interview/history">
                            <Button
                                variant="ghost"
                                className="border-border bg-bg-subtle/50 text-text-primary hover:bg-bg-subtle h-20 rounded-[2rem] border px-10 text-xl font-bold transition-all"
                            >
                                Interview History
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Features Bento Grid */}
            <section className="container mx-auto max-w-7xl px-6 py-24">
                <div className="mb-20 space-y-4">
                    <h2 className="text-text-primary text-4xl font-black tracking-tight md:text-6xl">
                        Built for High Performance.
                    </h2>
                    <p className="text-text-secondary max-w-2xl text-xl font-medium">
                        Everything you need to master elite technical interviews, all in one
                        seamless platform.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <FeatureCard
                        icon={Bot}
                        title="Adaptive AI"
                        description="Alex adjusts difficulty and hints based on your real-time performance, just like a real Lead Engineer."
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={Code}
                        title="Production Sandbox"
                        description="A secure, isolated environment to run code in 15+ languages with real-time test output."
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={BarChart3}
                        title="Deep Evaluation"
                        description="Post-session reports covering algorithmic complexity, clean code, and communication clarity."
                        delay={0.3}
                    />
                    <FeatureCard
                        icon={Shield}
                        title="Stress Simulation"
                        description="Experience the pressure of real Big Tech interviews with time-limits and live follow-up questions."
                        delay={0.4}
                    />
                    <FeatureCard
                        icon={Play}
                        title="Session Replays"
                        description="Review every message and code change to see exactly where you can improve your delivery."
                        delay={0.5}
                    />
                    <FeatureCard
                        icon={Mic}
                        title="Voice & Audio"
                        description="Optional low-latency audio interaction for a truly immersive, hand-free practicing experience."
                        delay={0.6}
                    />
                </div>
            </section>

            {/* How it Works - Interactive Scroll Section */}
            <section ref={journeyRef} className="relative px-6 py-20">
                <div className="container mx-auto max-w-7xl">
                    <div className="mb-10 space-y-4 text-center">
                        <div className="bg-accent/10 border-accent/20 text-accent mb-4 inline-block rounded-full border px-4 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase">
                            The Methodology
                        </div>
                        <h2 className="text-text-primary text-5xl leading-tight font-black tracking-tight md:text-8xl">
                            Elite Training Loop.
                        </h2>
                        <p className="text-text-secondary mx-auto mt-6 max-w-2xl text-lg leading-relaxed font-medium md:text-xl">
                            Mastery is born through repetition. Alex guides you through a continuous
                            cycle of challenging problems, objective AI evaluation, and targeted
                            improvement—ensuring you're battle-ready for the world's most
                            competitive technical interviews.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <HorizontalStep
                            number="01"
                            title="Pick Your Focus"
                            description="Select from our library of curated problems or let Alex surprise you with a real-world scenario."
                            index={1}
                        />
                        <HorizontalStep
                            number="02"
                            title="Face the AI"
                            description="Enter the virtual cabin. Alex will introduce the problem and probe your architectural decisions."
                            index={2}
                        />
                        <HorizontalStep
                            number="03"
                            title="Code & Communicate"
                            description="Solve the problem in our production-grade editor while explaining your logic out loud or via chat."
                            index={3}
                        />
                        <HorizontalStep
                            number="04"
                            title="Expert Analysis"
                            description="Receive a professional scorecard with feedback normally reserved for internal hiring committees."
                            index={4}
                        />
                    </div>
                </div>
            </section>

            {/* Final Conversion & Insights Section */}
            <section className="relative overflow-hidden py-40">
                <div className="bg-bg-subtle/30 absolute inset-0 -z-10" />
                <div className="container mx-auto max-w-7xl px-6">
                    <div className="flex flex-col items-center gap-20 lg:flex-row">
                        {/* Interactive Insights Preview */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="w-full lg:w-1/2"
                        >
                            <div className="matte-surface border-accent/10 relative rounded-[3rem] p-8 shadow-2xl md:p-12">
                                <div className="mb-10 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="text-text-primary text-2xl font-black">
                                            Growth Track
                                        </h4>
                                        <p className="text-text-secondary text-sm font-medium">
                                            Session #12 Analysis
                                        </p>
                                    </div>
                                    <div className="bg-accent/10 text-accent rounded-2xl px-4 py-2 text-xs font-black tracking-widest uppercase">
                                        Live Pulse
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {[
                                        {
                                            label: 'Technical Communication',
                                            score: 88,
                                            color: 'bg-accent',
                                        },
                                        {
                                            label: 'Problem Solving Speed',
                                            score: 94,
                                            color: 'bg-blue-500',
                                        },
                                        {
                                            label: 'Code Architecture',
                                            score: 82,
                                            color: 'bg-purple-500',
                                        },
                                    ].map((stat, i) => (
                                        <div key={i} className="space-y-3">
                                            <div className="flex justify-between text-sm font-bold">
                                                <span className="text-text-primary">
                                                    {stat.label}
                                                </span>
                                                <span className="text-accent">{stat.score}%</span>
                                            </div>
                                            <div className="bg-border/40 h-3 w-full overflow-hidden rounded-full">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${stat.score}%` }}
                                                    transition={{
                                                        duration: 1.5,
                                                        delay: 0.5 + i * 0.2,
                                                    }}
                                                    className={`${stat.color} h-full rounded-full`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-12 flex justify-center">
                                    <div className="bg-bg-page border-border flex items-center gap-4 rounded-2xl border px-6 py-4 shadow-xl">
                                        <Trophy className="text-accent h-6 w-6" />
                                        <div className="text-left">
                                            <p className="text-text-primary text-sm font-black">
                                                Top 5% Tier
                                            </p>
                                            <p className="text-text-secondary text-xs font-medium">
                                                Ready for Senior roles
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* CTA Content */}
                        <div className="w-full space-y-10 text-left lg:w-1/2">
                            <div className="space-y-6">
                                <h2 className="text-text-primary text-5xl leading-[0.9] font-[1000] tracking-tighter md:text-7xl">
                                    Your Dream Offer is <br />
                                    <span className="text-accent font-serif italic">
                                        One Practice Away.
                                    </span>
                                </h2>
                                <p className="text-text-secondary text-xl leading-relaxed font-medium opacity-90">
                                    Stop guessing which areas you need to improve. Our AI-driven
                                    evaluations provide the exact precision feedback needed to break
                                    through the barrier into Big Tech.
                                </p>
                            </div>

                            <div className="flex flex-col gap-6 sm:flex-row">
                                <Link href="/interview/new">
                                    <Button
                                        size="lg"
                                        className="bg-accent hover:bg-accent-hover shadow-accent/20 h-20 rounded-[2rem] px-12 text-xl font-black text-black shadow-2xl transition-all hover:scale-105"
                                    >
                                        Launch Interview
                                        <ArrowRight className="ml-3 h-6 w-6" />
                                    </Button>
                                </Link>
                                <Link href="/interview/history">
                                    <Button
                                        variant="ghost"
                                        size="lg"
                                        className="border-border bg-bg-subtle/50 text-text-primary hover:bg-bg-subtle h-20 rounded-[2rem] border px-10 text-xl font-bold"
                                    >
                                        View Stats
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="border-border border-t py-12 text-center">
                <p className="text-text-muted text-[10px] font-bold tracking-[0.3em] uppercase">
                    CodeArena AI • Powering the next generation of engineers
                </p>
            </footer>
        </main>
    )
}
