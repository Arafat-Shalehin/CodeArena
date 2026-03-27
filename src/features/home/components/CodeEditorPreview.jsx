'use client'

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * @component CodeEditorPreview
 * @description A visual representation of a code editor with a self-typing Python solution.
 */
export default function CodeEditorPreview({ className }) {
    const language = 'python' // Static preview language
    const [currentLineIndex, setCurrentLineIndex] = useState(0)
    const [currentCharIndex, setCurrentCharIndex] = useState(0)

    const codeLines = [
        {
            text: 'def solve_challenge(data):',
            tokens: [
                { text: 'def', color: 'text-accent font-bold' },
                { text: ' ', color: '' },
                { text: 'solve_challenge', color: 'text-info' },
                { text: '(data):', color: '' },
            ],
        },
        {
            text: '    # Optimized complexity: O(log N)',
            tokens: [
                { text: '    # Optimized complexity: O(log N)', color: 'text-text-muted italic' },
            ],
        },
        {
            text: '    left, right = 0, len(data)',
            tokens: [
                { text: '    left, right = ', color: '' },
                { text: '0', color: 'text-emerald-500 dark:text-emerald-400' },
                { text: ', ', color: '' },
                { text: 'len', color: 'text-emerald-500 dark:text-emerald-400' },
                { text: '(data)', color: '' },
            ],
        },
        {
            text: '    while left < right:',
            tokens: [
                { text: '    ', color: '' },
                { text: 'while', color: 'text-accent font-bold' },
                { text: ' left < right:', color: '' },
            ],
        },
        {
            text: '        mid = (left + right) // 2',
            tokens: [
                { text: '        mid = (left + right) // ', color: '' },
                { text: '2', color: 'text-emerald-500 dark:text-emerald-400' },
            ],
        },
        {
            text: '    return "CodeArena Legend"',
            tokens: [
                { text: '    ', color: '' },
                { text: 'return', color: 'text-accent font-bold' },
                { text: ' "CodeArena Legend"', color: 'text-amber-500' },
            ],
        },
    ]

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentLineIndex < codeLines.length) {
                const currentLine = codeLines[currentLineIndex].text
                if (currentCharIndex < currentLine.length) {
                    setCurrentCharIndex((prev) => prev + 1)
                } else {
                    const lineDelay = setTimeout(() => {
                        setCurrentLineIndex((prev) => prev + 1)
                        setCurrentCharIndex(0)
                    }, 400)
                    return () => clearTimeout(lineDelay)
                }
            }
        }, 35)
        return () => clearTimeout(timer)
    }, [currentLineIndex, currentCharIndex, codeLines.length])

    const getLineContent = (lineIdx) => {
        const fullLine = codeLines[lineIdx]
        if (lineIdx > currentLineIndex) return null
        if (lineIdx < currentLineIndex) {
            return fullLine.tokens.map((t, i) => (
                <span key={i} className={t.color}>
                    {t.text}
                </span>
            ))
        }

        let currentLength = 0
        return fullLine.tokens.map((t, i) => {
            const start = currentLength
            currentLength += t.text.length
            if (currentCharIndex <= start) return null
            const visibleText = t.text.slice(0, currentCharIndex - start)
            return (
                <span key={i} className={t.color}>
                    {visibleText}
                </span>
            )
        })
    }

    return (
        <div className={cn('group relative [perspective:2000px]', className)}>
            {/* Animated Glow Backdrops */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="from-accent/20 absolute -inset-12 rounded-[4rem] bg-gradient-to-tr to-transparent blur-3xl"
            />

            <motion.div
                initial={{ rotateX: 45, y: 100, opacity: 0, scale: 0.9 }}
                animate={{ rotateX: 0, y: 0, opacity: 1, scale: 1 }}
                transition={{
                    duration: 1.4,
                    delay: 0.2,
                    ease: [0.16, 1, 0.3, 1],
                }}
                className="bg-bg-page border-border relative overflow-hidden rounded-3xl border-2 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-3xl"
            >
                {/* Editor Header */}
                <div className="border-border bg-bg-muted/40 flex items-center justify-between border-b px-6 py-4">
                    <div className="flex gap-2">
                        <div className="size-3 rounded-full bg-red-500/50" />
                        <div className="size-3 rounded-full bg-amber-500/50" />
                        <div className="size-3 rounded-full bg-emerald-500/50" />
                    </div>
                    <div className="text-text-muted flex items-center gap-2 font-mono text-[11px] font-bold tracking-widest uppercase opacity-60">
                        <Terminal size={12} />
                        solution.py — {language.toUpperCase()}
                    </div>
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-accent flex items-center gap-1.5 text-[10px] font-black uppercase"
                        >
                            <span className="bg-accent size-1.5 animate-pulse rounded-full" />
                            Live
                        </motion.div>
                    </div>
                </div>

                {/* Editor Content Area */}
                <div className="p-8 font-mono text-[14px] leading-relaxed">
                    <div className="space-y-1.5">
                        {codeLines.map((_, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + idx * 0.1 }}
                                className="flex gap-6"
                            >
                                <span className="text-text-muted/30 w-5 text-right select-none">
                                    {idx + 1}
                                </span>
                                <div className="min-h-[1.5em]">
                                    {getLineContent(idx)}
                                    {idx === currentLineIndex && (
                                        <motion.span
                                            animate={{ opacity: [1, 0] }}
                                            transition={{ duration: 0.8, repeat: Infinity }}
                                            className="bg-accent ml-1 inline-block h-4 w-2 align-middle shadow-[0_0_8px_var(--ca-accent)]"
                                        />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Editor Footer / AI Analysis Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.5, duration: 0.8 }}
                        className="border-border mt-10 flex items-center justify-between border-t pt-8"
                    >
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="bg-success/20 flex size-6 items-center justify-center rounded-full">
                                    <div className="bg-success size-2 rounded-full" />
                                </div>
                                <span className="text-success-text text-[11px] font-bold uppercase">
                                    Tests Passed: 24/24
                                </span>
                            </div>
                            <span className="text-text-muted text-[11px] font-medium opacity-60">
                                1.2ms latency · 14.2MB
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="bg-bg-muted hover:bg-bg-subtle text-text-secondary rounded-xl px-4 py-2 text-[11px] font-bold transition-all">
                                View Logs
                            </button>
                            <button className="bg-accent shadow-accent-glow flex items-center gap-2 rounded-xl px-5 py-2.5 text-[11px] font-black text-white transition-all hover:scale-105 active:scale-95">
                                <Sparkles size={14} />
                                Submit Solution
                            </button>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}

CodeEditorPreview.propTypes = {
    className: PropTypes.string,
}
