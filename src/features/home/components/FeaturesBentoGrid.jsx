'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion'
import { featuresData } from '../data/features.data'

const TerminalPreview = () => (
    <div className="bg-bg-page/50 border-border/60 mt-2 w-full overflow-hidden rounded-lg border p-2 font-mono text-[8px] leading-relaxed sm:text-[9px]">
        <div className="border-border/40 mb-1 flex items-center gap-1.5 border-b pb-1 opacity-40">
            <span className="bg-error size-1.5 rounded-full" />
            <span className="bg-warning size-1.5 rounded-full" />
            <span className="bg-success size-1.5 rounded-full" />
        </div>
        <div className="text-text-secondary flex flex-col gap-0.5">
            <div>
                <span className="text-text-muted">$</span> docker run codearena/runner
            </div>
            <div>
                <span className="text-success">[OK]</span> Isolated · 256MB
            </div>
            <div className="text-success font-display text-[9px] font-bold sm:text-[10px]">
                [VERDICT: ACCEPTED]
            </div>
        </div>
    </div>
)

const spanMap = {
    docker: 'col-span-2 lg:col-span-2',
    judge: 'col-span-1',
    auth: 'col-span-1',
    browser: 'col-span-1',
    history: 'col-span-1',
    apis: 'col-span-1',
    'ai-interview': 'col-span-1',
}

export default function FeaturesBentoGrid() {
    const containerRef = useRef(null)
    const isInView = useInView(containerRef, { once: true, margin: '120px' })

    return (
        <div
            ref={containerRef}
            className="mx-auto grid w-full grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        >
            {isInView
                ? featuresData.map((feature, idx) => (
                      <FeatureCard key={feature.id} feature={feature} index={idx} />
                  ))
                : Array.from({ length: featuresData.length }).map((_, idx) => (
                      <div key={idx} className="bg-bg-subtle h-28 animate-pulse rounded-xl" />
                  ))}
        </div>
    )
}

function FeatureCard({ feature, index }) {
    const shouldReduceMotion = useSafeReducedMotion()
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-30px' })
    const colSpanClass = spanMap[feature.id] || 'col-span-1'

    return (
        <motion.div
            ref={ref}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={isInView || shouldReduceMotion ? { opacity: 1, y: 0 } : {}}
            transition={{
                duration: 0.35,
                delay: shouldReduceMotion ? 0 : index * 0.04,
                ease: [0.16, 1, 0.3, 1],
            }}
            className={`group relative ${colSpanClass}`}
        >
            <div className="border-border/60 bg-bg-subtle/30 hover:border-accent/40 relative flex h-full min-h-[120px] flex-col overflow-hidden rounded-xl border p-3 transition-all duration-300 sm:p-4">
                <div className="flex items-start gap-3">
                    <div className="border-border/40 bg-bg-page mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border">
                        <div className="text-text-secondary group-hover:text-accent transition-colors duration-300 [&_svg]:size-3">
                            {feature.icon}
                        </div>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                        <h3 className="text-text-primary truncate text-sm font-bold tracking-tight">
                            {feature.title}
                        </h3>
                        <p className="text-text-secondary mt-0.5 text-[10px] leading-snug font-medium sm:text-[11px]">
                            {feature.desc}
                        </p>
                    </div>
                </div>

                {feature.proof && (
                    <span className="text-text-muted border-border/40 group-hover:border-accent/30 group-hover:text-accent mt-auto inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[7px] font-semibold tracking-wider uppercase transition-colors sm:text-[8px]">
                        {feature.proof}
                    </span>
                )}

                {feature.size === 'hero' && <TerminalPreview />}
            </div>
        </motion.div>
    )
}
