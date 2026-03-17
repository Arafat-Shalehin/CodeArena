'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

/**
 * @component CareersHero
 * @description The hero section for the Careers Page.
 */
export default function CareersHero() {
    return (
        <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
            {/* Background Decorative Pattern */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(2,186,76,0.05)_0%,rgba(255,255,255,0)_100%)]" />

            <div className="max-w-container mx-auto px-4 text-center md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="bg-accent-light text-accent-text mb-6 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
                        Join the Revolution
                    </span>
                    <h1 className="text-text-primary mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                        Help us build the <br />
                        <span className="text-accent">future of programming</span>
                    </h1>
                    <p className="text-text-secondary mx-auto mb-10 max-w-2xl text-lg leading-relaxed md:text-xl">
                        At CodeArena, we are building the world's most advanced platform for
                        competitive programming and automated software evaluation. We're looking for
                        passionate minds to join us.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button size="lg" className="h-auto px-8 py-6 text-lg">
                            View Open Roles
                            <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="text-text-primary border-border hover:bg-bg-subtle h-auto px-8 py-6 text-lg"
                        >
                            Life at CodeArena
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
