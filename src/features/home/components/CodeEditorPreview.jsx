'use client'

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * @component CodeEditorPreview
 * @description A visual representation of a code editor with a self-typing Python solution.
 */
export default function CodeEditorPreview({ className }) {
    const [displayedLines, setDisplayedLines] = useState([])
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
            text: '    # Apply optimized binary search',
            tokens: [{ text: '    # Apply optimized binary search', color: 'text-text-muted' }],
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
    ]

    useEffect(() => {
        if (currentLineIndex < codeLines.length) {
            const currentLine = codeLines[currentLineIndex].text
            if (currentCharIndex < currentLine.length) {
                const timeout = setTimeout(() => {
                    setCurrentCharIndex((prev) => prev + 1)
                }, 30) // Typing speed
                return () => clearTimeout(timeout)
            } else {
                const timeout = setTimeout(() => {
                    setCurrentLineIndex((prev) => prev + 1)
                    setCurrentCharIndex(0)
                }, 500) // Delay between lines
                return () => clearTimeout(timeout)
            }
        }
    }, [currentLineIndex, currentCharIndex])

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

        // Current typing line
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
        <div className={cn('group relative [perspective:1500px]', className)}>
            {/* Pulsing Glow Effect */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="from-accent/15 dark:from-accent/10 absolute -inset-8 rounded-[3rem] bg-gradient-to-tr to-transparent blur-3xl"
            />

            <motion.div
                initial={{ rotateX: 60, y: 100, opacity: 0 }}
                animate={{ rotateX: 0, y: 0, opacity: 1 }}
                transition={{
                    duration: 1.2,
                    delay: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                }}
                style={{ transformOrigin: 'bottom center' }}
                className="matte-surface border-border/50 bg-bg-subtle/30 relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-sm"
            >
                {/* Editor Title Bar */}
                <div className="border-border bg-bg-muted/50 flex items-center justify-between border-b px-4 py-3">
                    <div className="flex gap-1.5">
                        <div className="size-2.5 rounded-full bg-red-400/60 dark:bg-red-500/40" />
                        <div className="size-2.5 rounded-full bg-amber-400/60 dark:bg-amber-500/40" />
                        <div className="size-2.5 rounded-full bg-emerald-400/60 dark:bg-emerald-500/40" />
                    </div>
                    <div className="text-text-muted font-mono text-[10px] tracking-tight uppercase">
                        solution.py — CodeArena
                    </div>
                    <div className="flex gap-3">
                        <Terminal className="text-text-muted size-4" />
                    </div>
                </div>

                {/* Editor Content */}
                <div className="bg-bg-page/50 text-text-secondary dark:bg-bg-page/20 p-8 font-mono text-[13px] leading-relaxed">
                    <div className="space-y-1">
                        {codeLines.map((_, idx) => (
                            <div key={idx} className="flex gap-4">
                                <span className="text-text-muted/60 w-4 text-right select-none">
                                    {idx + 1}
                                </span>
                                <div className="min-h-[1.5em]">
                                    {getLineContent(idx)}
                                    {idx === currentLineIndex && (
                                        <motion.span
                                            animate={{ opacity: [1, 0] }}
                                            transition={{ duration: 0.8, repeat: Infinity }}
                                            className="bg-accent ml-1 inline-block h-4 w-1.5 align-middle"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Editor Footer / Status Bar */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3 }}
                        className="border-border mt-8 flex items-center justify-between border-t pt-6"
                    >
                        <div className="flex items-center gap-4">
                            <span className="bg-success-light text-success-text rounded px-2 py-0.5 text-[10px] font-bold">
                                PASS 24/24
                            </span>
                            <span className="text-text-muted text-[10px]">1.2ms latency</span>
                        </div>
                        <button className="bg-accent shadow-accent-glow min-h-11 cursor-pointer rounded px-4 py-2 text-[10px] font-bold text-white transition-all hover:scale-105 active:scale-95">
                            Submit Draft
                        </button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}

CodeEditorPreview.propTypes = {
    className: PropTypes.string,
}
