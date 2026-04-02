'use client'

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

const auditData = [
    { key: 'RUNNER_ENGINE', value: 'DOCKER_V4' },
    { key: 'ISOLATION', value: 'CGROUP_V2' },
    { key: 'LATENCY_TARGET', value: '< 120MS' },
    { key: 'AUTH_PROTOCOL', value: 'FIREBASE_JWT' },
    { key: 'SYNC_STRATEGY', value: 'REALTIME' },
    { key: 'MEM_LIMIT', value: '512MB_HARD' },
    { key: 'SIGNAL_BUS', value: 'TX_STREAM' },
]

export default function FeaturesHeader() {
    return (
        <div className="mb-16 grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Column: Context */}
            <div className="lg:col-span-7 lg:text-left">
                {/* Headline */}
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="font-display text-text-primary text-3xl leading-[1.12] font-black tracking-tight [text-wrap:balance] sm:text-4xl md:text-5xl lg:text-6xl"
                >
                    Everything you need to{' '}
                    <span className="text-accent italic">practice, compete,</span> and get interview
                    ready.
                </motion.h2>

                {/* Subtext */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-text-secondary mt-6 max-w-2xl text-sm leading-relaxed font-medium [text-wrap:balance] md:text-base lg:text-lg"
                >
                    Fast judging, secure execution, and clear progress signals in one focused
                    workflow. Built by developers, for developers.
                </motion.p>
            </div>
            {/* Right Column: Capability Audit Panel */}
            <div className="hidden lg:col-span-1 lg:block" /> {/* Gap spacer */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="bg-bg-subtle/50 border-border relative hidden h-[200px] flex-col overflow-hidden rounded-2xl border p-6 backdrop-blur-md lg:col-span-4 lg:flex"
            >
                <div className="border-border/40 mb-3 flex items-center justify-between border-b pb-3">
                    <span className="text-text-muted flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase">
                        <Zap className="text-accent size-3" />
                        Capability Audit
                    </span>
                    <span className="bg-success/10 text-success rounded-full px-2 py-0.5 text-[9px] font-bold">
                        SYSTEM_ACTIVE
                    </span>
                </div>

                <div className="relative flex-1 overflow-hidden">
                    <motion.div
                        animate={{ y: [0, -180] }}
                        transition={{
                            repeat: Infinity,
                            duration: 12,
                            ease: 'linear',
                        }}
                        className="flex flex-col gap-2 font-mono"
                    >
                        {auditData.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between gap-4 py-1 text-[11px]"
                            >
                                <span className="text-text-muted hover:text-text-primary cursor-default whitespace-nowrap transition-colors">
                                    {item.key}
                                </span>
                                <span className="text-accent bg-accent/10 rounded px-1.5 py-0.5 font-bold uppercase">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                        {/* Duplicate for seamless scroll */}
                        {auditData.map((item, idx) => (
                            <div
                                key={`dup-${idx}`}
                                className="flex items-center justify-between gap-4 py-1 text-[11px]"
                            >
                                <span className="text-text-muted whitespace-nowrap">
                                    {item.key}
                                </span>
                                <span className="text-accent bg-accent/10 rounded px-1.5 py-0.5 font-bold uppercase">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Vertical gradient masking for ticker */}
                <div className="from-bg-subtle/80 pointer-events-none absolute inset-x-0 top-12 h-8 bg-gradient-to-b to-transparent" />
                <div className="to-bg-subtle/80 pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent" />
            </motion.div>
        </div>
    )
}
