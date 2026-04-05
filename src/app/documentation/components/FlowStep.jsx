'use client'

export default function FlowStep({ num, title, desc }) {
    return (
        <div className="border-border flex gap-4 border-b pb-4 last:border-b-0 last:pb-0">
            <div className="border-accent/30 bg-accent-light text-accent flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-bold">
                {num}
            </div>
            <div>
                <strong className="text-text-primary font-sans text-sm">{title}</strong>
                <p className="text-text-muted mt-0.5 text-xs">{desc}</p>
            </div>
        </div>
    )
}
