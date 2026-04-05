'use client'

export default function CodeBlock({ children, lang = 'bash' }) {
    return (
        <div className="border-border bg-bg-subtle relative overflow-hidden rounded-lg border">
            <div className="border-border flex items-center justify-between border-b px-4 py-2">
                <span className="text-text-muted font-mono text-xs tracking-wide uppercase">
                    {lang}
                </span>
            </div>
            <pre className="overflow-x-auto p-4">
                <code className="text-text-primary font-mono text-sm">{children}</code>
            </pre>
        </div>
    )
}
