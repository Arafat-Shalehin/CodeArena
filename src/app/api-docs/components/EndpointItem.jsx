'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import CodeBlock from './CodeBlock'

export default function EndpointItem({ endpoint }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border-border/30 border-b last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="hover:bg-bg-subtle/50 flex w-full items-center gap-3 px-5 py-4 text-left transition-colors"
            >
                <span
                    className={`rounded-md border px-2.5 py-1 font-mono text-[11px] font-bold ${endpoint.methodColor}`}
                >
                    {endpoint.method}
                </span>
                <code className="text-text-primary text-sm font-semibold">{endpoint.path}</code>
                <span className="text-text-muted ml-auto hidden text-xs sm:inline">
                    {endpoint.summary}
                </span>
                <ChevronDown
                    className={`text-text-muted size-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-4 px-5 pb-5">
                            <p className="text-text-muted text-sm sm:hidden">{endpoint.summary}</p>
                            {endpoint.request && (
                                <CodeBlock code={endpoint.request} label="Request Body" />
                            )}
                            <CodeBlock code={endpoint.response} label="Response" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
