'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import CodeEditorPreview from './CodeEditorPreview'

/**
 * @component FloatingElement
 * @description Renders a floating tech-themed icon/text for the background.
 */
const FloatingElement = ({ children, initialX, initialY, duration, delay = 0 }) => (
    <motion.div
        initial={{ x: initialX, y: initialY, opacity: 0 }}
        animate={{
            y: [initialY, initialY - 40, initialY],
            opacity: [0, 0.4, 0],
        }}
        transition={{
            duration,
            repeat: Infinity,
            delay,
            ease: 'easeInOut',
        }}
        className="text-accent/30 absolute font-mono text-4xl select-none"
    >
        {children}
    </motion.div>
)

export default function Hero() {
    return (
        <section className="hero-gradient relative overflow-hidden pt-10 pb-8">
            {/* Background Animations: Tech Debris */}
            <div className="absolute inset-0 z-0 opacity-40">
                <FloatingElement initialX="10%" initialY="20%" duration={8}>
                    {'</>'}
                </FloatingElement>
                <FloatingElement initialX="85%" initialY="15%" duration={10} delay={2}>
                    {'{ }'}
                </FloatingElement>
                <FloatingElement initialX="5%" initialY="70%" duration={12} delay={1}>
                    {';'}
                </FloatingElement>
                <FloatingElement initialX="90%" initialY="80%" duration={9} delay={3}>
                    {'['}
                </FloatingElement>
                <FloatingElement initialX="40%" initialY="10%" duration={14} delay={5}>
                    {'def'}
                </FloatingElement>
            </div>

            <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 lg:grid-cols-2">
                {/* Left Column: Content */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.12, delayChildren: 0.2 },
                        },
                    }}
                    className="relative z-10 space-y-8 text-center lg:text-left"
                >
                    {/* Headline */}
                    <div className="overflow-visible pb-4">
                        <h1 className="text-text-primary pt-4 pb-2 font-sans text-6xl leading-[1.1] font-extrabold tracking-[-0.04em] sm:text-7xl lg:text-8xl">
                            <motion.span
                                variants={{
                                    hidden: { y: 60, opacity: 0 },
                                    visible: {
                                        y: 0,
                                        opacity: 1,
                                        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                                    },
                                }}
                                className="mr-[0.2em] inline-block"
                            >
                                Master
                            </motion.span>
                            <br className="lg:hidden" />
                            <motion.span
                                variants={{
                                    hidden: { y: 60, opacity: 0 },
                                    visible: {
                                        y: 0,
                                        opacity: 1,
                                        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                                    },
                                }}
                                className="text-accent inline-block font-serif italic drop-shadow-[0_0_15px_rgba(0,200,83,0.3)]"
                            >
                                Algorithms.
                            </motion.span>
                        </h1>
                    </div>

                    {/* Subheadline */}
                    <motion.p
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                            },
                        }}
                        className="text-text-secondary mx-auto max-w-xl text-lg leading-relaxed md:text-xl lg:mx-0"
                    >
                        The premier competitive programming platform. Elevate your coding skills,
                        prepare for top-tier tech interviews, and compete in live global contests.
                        Your technical legacy starts here.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                            },
                        }}
                        className="flex flex-col justify-center gap-4 pt-2 sm:flex-row lg:justify-start"
                    >
                        <Button
                            variant="default"
                            size="lg"
                            className="bg-accent shadow-accent-glow hover:bg-accent-hover h-12 w-full px-8 text-base transition-all hover:scale-105 active:scale-95 sm:w-auto"
                        >
                            Start Solving
                            <span className="material-symbols-outlined ml-2 text-sm">
                                arrow_forward
                            </span>
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            className="bg-bg-page hover:bg-bg-subtle border-border hover:border-accent/40 h-12 w-full border px-8 text-base transition-all sm:w-auto"
                        >
                            View Contests
                        </Button>
                    </motion.div>

                    {/* Social Proof Stats (Desktop Only) */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { delay: 1 } },
                        }}
                        className="border-border hidden items-center gap-12 border-t pt-10 lg:flex"
                    >
                        <div>
                            <div className="text-text-primary font-sans text-2xl font-extrabold tracking-tight">
                                100k+
                            </div>
                            <div className="text-text-muted mt-1 text-xs font-bold tracking-widest uppercase">
                                Active Coders
                            </div>
                        </div>
                        <div className="bg-border h-10 w-px" />
                        <div>
                            <div className="text-text-primary font-sans text-2xl font-extrabold tracking-tight">
                                25+
                            </div>
                            <div className="text-text-muted mt-1 text-xs font-bold tracking-widest uppercase">
                                Global Sponsors
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Right Column: Visual */}
                <motion.div
                    initial={{ opacity: 0, x: 50, rotate: 2 }}
                    animate={{ opacity: 1, x: 0, rotate: 0 }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    className="relative z-10"
                >
                    <CodeEditorPreview className="mx-auto lg:mx-0" />
                </motion.div>
            </div>

            {/* Mobile Stats (Below everything on mobile) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="border-border bg-bg-subtle/50 -mx-4 mt-12 border-t px-4 pt-8 lg:hidden"
            >
                <div className="flex items-center justify-center gap-12">
                    <div className="text-center">
                        <div className="text-text-primary font-sans text-3xl font-black tracking-tight">
                            100k+
                        </div>
                        <div className="text-text-muted mt-1 text-[10px] font-bold tracking-widest uppercase">
                            Active Coders
                        </div>
                    </div>
                    <div className="border-border h-10 w-px" />
                    <div className="text-center">
                        <div className="text-text-primary font-sans text-3xl font-black tracking-tight">
                            25+
                        </div>
                        <div className="text-text-muted mt-1 text-[10px] font-bold tracking-widest uppercase">
                            Global Sponsors
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    )
}
