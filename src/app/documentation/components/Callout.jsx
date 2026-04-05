'use client'

export default function Callout({ type = 'info', label, children }) {
    const styles = {
        info: 'border-l-info bg-info-light',
        warn: 'border-l-warning bg-warning-light',
        tip: 'border-l-accent bg-accent-light',
    }
    const labelStyles = {
        info: 'text-info',
        warn: 'text-warning',
        tip: 'text-accent-text',
    }
    return (
        <div className={`rounded-r-lg border-l-4 p-4 ${styles[type]}`}>
            <p
                className={`mb-1 font-mono text-[10px] font-bold tracking-widest uppercase ${labelStyles[type]}`}
            >
                {label}
            </p>
            <div className="text-text-secondary text-sm">{children}</div>
        </div>
    )
}
