'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion'

export default function SkillShiftSection() {
    const shouldReduceMotion = useSafeReducedMotion()

    return (
        <section className="bg-bg-page text-text-primary border-border w-full border-y px-4 py-24 sm:py-32">
            <div className="mx-auto max-w-5xl text-center">
                <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    <h2 className="mb-10 font-sans text-5xl leading-tight font-black tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                        You're writing code.
                        <br className="hidden sm:block" />
                        <span className="text-text-muted font-bold">
                            But are you writing{' '}
                            <em className="text-text-primary font-serif font-normal italic">
                                fast
                            </em>{' '}
                            code?
                        </span>
                    </h2>

                    <div className="mx-auto mb-14 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
                        <div className="border-border bg-bg-subtle flex flex-col items-center justify-center rounded-lg border p-6 shadow-sm">
                            <span className="text-accent mb-2 font-mono text-4xl font-bold sm:text-5xl">
                                2,500+
                            </span>
                            <span className="text-text-secondary text-sm font-medium tracking-wider uppercase">
                                Curated Problems
                            </span>
                        </div>
                        <div className="border-border bg-bg-subtle flex flex-col items-center justify-center rounded-lg border p-6 shadow-sm">
                            <span className="text-accent mb-2 font-mono text-4xl font-bold sm:text-5xl">
                                50x
                            </span>
                            <span className="text-text-secondary text-sm font-medium tracking-wider uppercase">
                                Faster Prep
                            </span>
                        </div>
                        <div className="border-border bg-bg-subtle flex flex-col items-center justify-center rounded-lg border p-6 shadow-sm">
                            <span className="text-accent mb-2 font-mono text-4xl font-bold sm:text-5xl">
                                1M+
                            </span>
                            <span className="text-text-secondary text-sm font-medium tracking-wider uppercase">
                                Submissions
                            </span>
                        </div>
                    </div>

                    <Link href="/signup">
                        <Button
                            variant="default"
                            size="lg"
                            className="bg-accent hover:bg-accent-hover duration-normal focus:ring-accent inline-flex h-14 items-center justify-center gap-2 rounded-md px-10 text-lg font-semibold text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                        >
                            Enter the Arena
                            <ArrowRight className="size-5" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}
