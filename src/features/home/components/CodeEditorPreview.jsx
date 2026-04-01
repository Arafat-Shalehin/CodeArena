'use client'

import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { Terminal, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * @component CodeEditorPreview
 * @description A visual representation of a code editor with an instantly visiblethon solution.
 */
const CODE_LINES = [
    {
        tokens: [
            { text: 'def', color: 'text-accent font-bold' },
            { text: ' ', color: '' },
            { text: 'solve_challenge', color: 'text-info' },
            { text: '(data):', color: '' },
        ],
    },
    {
        tokens: [{ text: '    # Optimized complexity: O(log N)', color: 'text-text-muted italic' }],
    },
    {
        tokens: [
            { text: '    left, right = ', color: '' },
            { text: '0', color: 'text-emerald-500 dark:text-emerald-400' },
            { text: ', ', color: '' },
            { text: 'len', color: 'text-emerald-500 dark:text-emerald-400' },
            { text: '(data)', color: '' },
        ],
    },
    {
        tokens: [
            { text: '    ', color: '' },
            { text: 'while', color: 'text-accent font-bold' },
            { text: ' left < right:', color: '' },
        ],
    },
    {
        tokens: [
            { text: '        mid = (left + right) // ', color: '' },
            { text: '2', color: 'text-emerald-500 dark:text-emerald-400' },
        ],
    },
    {
        tokens: [
            { text: '    ', color: '' },
            { text: 'return', color: 'text-accent font-bold' },
            { text: ' "CodeArena Legend"', color: 'text-amber-500' },
        ],
    },
]

export default function CodeEditorPreview({ className }) {
    const language = 'python' // Static preview language

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
                initial={false}
                animate={{ rotateX: 0, y: 0, opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.55,
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
                        {CODE_LINES.map((line, idx) => (
                            <div key={idx} className="flex gap-6">
                                <span className="text-text-muted/30 w-5 text-right select-none">
                                    {idx + 1}
                                </span>
                                <div className="min-h-[1.5em]">
                                    {line.tokens.map((token, tokenIndex) => (
                                        <span key={tokenIndex} className={token.color}>
                                            {token.text}
                                        </span>
                                    ))}
                                    {idx === CODE_LINES.length - 1 && (
                                        <motion.span
                                            animate={{ opacity: [1, 0] }}
                                            transition={{ duration: 0.8, repeat: Infinity }}
                                            className="bg-accent ml-1 inline-block h-4 w-2 align-middle shadow-[0_0_8px_var(--ca-accent)]"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Editor Footer / AI Analysis Preview */}
                    <motion.div
                        initial={false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
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
