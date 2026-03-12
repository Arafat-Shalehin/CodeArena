'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tiles } from '@/components/ui/tiles'
import { aboutContent } from '../data/about.data'
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion'
import Link from 'next/link'

/**
 * AboutHero component for the CodeArena platform.
 * Renders the primary landing section of the About page with high-impact typography
 * and an animated tile background.
 *
 * @component
 * @returns {React.ReactElement} The rendered Hero section.
 */
export default function AboutHero() {
    const { hero } = aboutContent
    const shouldReduceMotion = useSafeReducedMotion()

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
        },
    }

    return (
        <section className="bg-bg-page relative overflow-hidden py-20 md:py-32">
            {/* Background: Interactive Tiles (Project consistent pattern) */}
            <div className="absolute inset-0 z-0 opacity-5">
                <Tiles rows={30} cols={20} tileSize="lg" />
            </div>

            <div className="max-w-container relative z-10 mx-auto px-4 md:px-6">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="max-w-3xl"
                >
                    {/* Badge/Label */}
                    <motion.span
                        variants={itemVariants}
                        className="bg-accent-light text-accent-text inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase"
                    >
                        Our Story
                    </motion.span>

                    {/* Main Heading */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-text-primary mt-6 font-sans text-5xl leading-tight font-bold tracking-tight sm:text-6xl lg:text-7xl"
                    >
                        {hero.title} <span className="text-accent italic">{hero.accentTitle}</span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        variants={itemVariants}
                        className="text-text-secondary mt-8 max-w-2xl text-lg leading-relaxed md:text-xl"
                    >
                        {hero.subtitle}
                    </motion.p>

                    {/* CTAs */}
                    <motion.div variants={itemVariants} className="mt-10 flex flex-wrap gap-4">
                        <Button variant="default" size="lg">
                            <Link href="/problems" className="flex items-center">
                                {hero.cta}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            className="bg-bg-subtle border-border text-text-primary hover:bg-bg-muted"
                        >
                            {hero.secondaryCta}
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
