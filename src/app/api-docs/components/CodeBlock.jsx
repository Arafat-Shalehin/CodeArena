'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CodeBlock({ code, label }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="group relative">
            {label && (
                <div className="text-text-muted bg-bg-muted/60 border-border/50 inline-block rounded-t-lg border border-b-0 px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase">
                    {label}
                </div>
            )}
            <div
                className={`bg-bg-subtle border-border/50 relative overflow-hidden border ${label ? 'rounded-tr-xl rounded-b-xl' : 'rounded-xl'}`}
            >
                <button
                    onClick={handleCopy}
                    className="hover:bg-bg-muted text-text-muted hover:text-text-primary absolute top-2.5 right-2.5 rounded-lg p-1.5 transition-all"
                    title="Copy to clipboard"
                >
                    {copied ? (
                        <Check className="size-3.5 text-emerald-400" />
                    ) : (
                        <Copy className="size-3.5" />
                    )}
                </button>
                <pre className="no-scrollbar overflow-x-auto p-4 pr-12 text-[13px] leading-relaxed">
                    <code className="text-text-secondary font-mono">{code}</code>
                </pre>
            </div>
        </div>
    )
}
