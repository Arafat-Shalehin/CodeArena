'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

// Master Redesign Hero: High-Fidelity, Clean, Non-Animated Background
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
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] },
        },
    }

    return (
        <div className="bg-bg-page relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden">
            {/* Static Radial Spotlight for Visual Depth (No Animation) */}
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,186,76,0.03)_0%,transparent_70%)]"
                aria-hidden="true"
            />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-container relative z-10 mx-auto flex flex-col items-center px-6 py-12 text-center"
            >
                {badge && (
                    <motion.span
                        variants={itemVariants}
                        className="text-accent mb-10 text-[10px] font-bold tracking-[0.4em] uppercase"
                    >
                        {badge}
                    </motion.span>
                )}

                {title && (
                    <motion.h1
                        variants={itemVariants}
                        className="text-text-primary mb-8 max-w-5xl text-5xl leading-[1.0] font-black tracking-tight [text-wrap:balance] md:text-8xl"
                    >
                        {title}
                    </motion.h1>
                )}

                {subtitle && (
                    <motion.p
                        variants={itemVariants}
                        className="text-text-secondary mt-2 max-w-2xl text-lg leading-relaxed font-medium opacity-80 md:text-xl"
                    >
                        {subtitle}
                    </motion.p>
                )}

                <motion.div
                    variants={itemVariants}
                    className="mt-14 flex flex-col items-center justify-center gap-5 sm:flex-row"
                >
                    {primary && (
                        <Link href={primary.href}>
                            <Button className="bg-accent hover:bg-accent-hover hover:shadow-accent/20 h-14 rounded-md px-12 text-sm font-bold tracking-widest text-white uppercase shadow-lg transition-all duration-300">
                                {primary.label}
                            </Button>
                        </Link>
                    )}
                    {secondary && (
                        <Link href={secondary.href}>
                            <Button
                                variant="outline"
                                className="border-border hover:border-text-primary text-text-primary h-14 rounded-md bg-white px-12 text-sm font-bold tracking-widest uppercase shadow-sm transition-all duration-300 hover:bg-white hover:text-black"
                            >
                                {secondary.label}
                            </Button>
                        </Link>
                    )}
                </motion.div>
            </motion.div>
        </div>
    )
}
