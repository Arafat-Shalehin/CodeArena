'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Tiles } from '@/components/ui/tiles'

/**
 * @component HeroWithPixelBackground
 * @description Modern Technical Hero: High-density, professional layout with precise rounding and compact spacing.
 */
export default function HeroWithPixelBackground({ badge, title, subtitle, primary, secondary }) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    }

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            filter: 'blur(8px)',
        },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
            },
        },
    }

    return (
        <div className="bg-bg-page border-border/50 relative flex min-h-[55vh] w-full items-center justify-center overflow-hidden border-b">
            {/* Interactive Tiles Background - Premium Texture */}
            <div className="absolute inset-0 z-0">
                <Tiles
                    className="opacity-[0.08] lg:opacity-[0.12]"
                    rows={30}
                    cols={28}
                    tileSize="md"
                    tileClassName="border-neutral-300 dark:border-neutral-800/10"
                />
                {/* Overlay gradients for depth and spotlight */}
                <div
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,186,76,0.03)_0%,transparent_70%)]"
                    aria-hidden="true"
                />
                <div className="from-bg-page to-bg-page absolute inset-0 bg-gradient-to-b via-transparent opacity-100" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-container relative z-10 mx-auto flex flex-col items-center px-6 py-10 text-center"
            >
                {badge && (
                    <motion.span
                        variants={itemVariants}
                        className="text-accent mb-6 text-[10px] font-black tracking-[0.4em] uppercase"
                    >
                        {badge}
                    </motion.span>
                )}

                {title && (
                    <motion.h1
                        variants={itemVariants}
                        className="text-text-primary mb-6 max-w-4xl text-4xl leading-[1] font-[1000] tracking-tighter [text-wrap:balance] md:text-6xl"
                    >
                        {title}
                    </motion.h1>
                )}

                {subtitle && (
                    <motion.p
                        variants={itemVariants}
                        className="text-text-secondary mt-1 max-w-xl text-base leading-relaxed font-medium opacity-60 md:text-lg"
                    >
                        {subtitle}
                    </motion.p>
                )}

                <motion.div
                    variants={itemVariants}
                    className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
                >
                    {primary && (
                        <Link href={primary.href}>
                            <Button
                                variant="default"
                                className="transition-all hover:scale-105 active:scale-95"
                            >
                                {primary.label}
                            </Button>
                        </Link>
                    )}
                    {secondary && (
                        <Link href={secondary.href}>
                            <Button variant="ghost" className="transition-all hover:scale-105">
                                {secondary.label}
                            </Button>
                        </Link>
                    )}
                </motion.div>
            </motion.div>
        </div>
    )
}
