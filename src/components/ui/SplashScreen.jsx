'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion'

export function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true)
    const shouldReduceMotion = useSafeReducedMotion()

    useEffect(() => {
        if (shouldReduceMotion) {
            setIsVisible(false)
            return
        }

        const perfNow = typeof performance !== 'undefined' ? performance.now() : null
        const fastBoot = perfNow !== null && perfNow < 250
        const timeoutMs = fastBoot ? 700 : 1400

        const timer = setTimeout(() => {
            setIsVisible(false)
        }, timeoutMs)

        return () => clearTimeout(timer)
    }, [shouldReduceMotion])

    if (shouldReduceMotion) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.6 } }}
                    className="bg-bg-page fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
                >
                    {/* Background grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0f_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0f_1px,transparent_1px)] bg-[size:40px_40px] opacity-10" />

                    {/* Scan line */}
                    <motion.div
                        initial={{ y: '-100%' }}
                        animate={{ y: '100%' }}
                        transition={{
                            duration: 1.5,
                            ease: 'linear',
                            repeat: Infinity,
                        }}
                        className="absolute h-[2px] w-full bg-white/10"
                    />

                    <div className="relative z-10 flex flex-col items-center gap-6">
                        {/* Logo with glitch */}
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="font-display text-text-primary text-4xl font-black tracking-tight sm:text-5xl"
                        >
                            <span className="relative">
                                CodeArena
                                <motion.span
                                    className="absolute top-0 left-0 text-red-500 opacity-30"
                                    animate={{ x: [0, -2, 2, 0] }}
                                    transition={{
                                        duration: 0.3,
                                        repeat: Infinity,
                                    }}
                                >
                                    CodeArena
                                </motion.span>
                            </span>
                        </motion.h1>

                        {/* Terminal typing */}
                        <div className="text-text-secondary font-mono text-sm">
                            <TypingText text="initializing arena..." />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

function TypingText({ text }) {
    const [displayed, setDisplayed] = useState('')

    useEffect(() => {
        let i = 0
        const interval = setInterval(() => {
            setDisplayed(text.slice(0, i))
            i++
            if (i > text.length) clearInterval(interval)
        }, 40)

        return () => clearInterval(interval)
    }, [text])

    return (
        <span>
            {displayed}
            <span className="animate-pulse">|</span>
        </span>
    )
}
