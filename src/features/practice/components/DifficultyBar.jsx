'use client'

const DIFFICULTY_COLORS = {
    easy: { bar: 'bg-success', text: 'text-success' },
    medium: { bar: 'bg-warning', text: 'text-warning' },
    hard: { bar: 'bg-error', text: 'text-error' },
}

export default function DifficultyBar({ difficulties = {}, count = 0 }) {
    const easyCount = Number(difficulties?.easy || 0)
    const medCount = Number(difficulties?.medium || 0)
    const hardCount = Number(difficulties?.hard || 0)
    const total = Number(count || easyCount + medCount + hardCount || 1)

    const easyPct = (easyCount / total) * 100
    const medPct = (medCount / total) * 100
    const hardPct = (hardCount / total) * 100

    return (
        <div className="flex items-center gap-3">
            <div className="bg-border h-1.5 flex-1 overflow-hidden rounded-full">
                <div className="flex h-full">
                    <div className="bg-success h-full" style={{ width: `${easyPct}%` }} />
                    <div className="bg-warning h-full" style={{ width: `${medPct}%` }} />
                    <div className="bg-error h-full" style={{ width: `${hardPct}%` }} />
                </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className="text-success">{easyCount}E</span>
                <span className="text-warning">{medCount}M</span>
                <span className="text-error">{hardCount}H</span>
            </div>
        </div>
    )
}

export { DIFFICULTY_COLORS }
