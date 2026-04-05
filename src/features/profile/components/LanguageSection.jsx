'use client'

import { Dot } from 'lucide-react'

const LANGUAGE_COLORS = ['text-accent', 'text-warning', 'text-info', 'text-success']

const LANGUAGE_COLOR_MAP = {
    Python: 'bg-[#3572A5]',
    JavaScript: 'bg-[#F7DF1E]',
    'C++': 'bg-[#00599C]',
    Java: 'bg-[#5382a1]',
}

export default function LanguageSection({ languages }) {
    if (!languages?.length) return null

    const normalized = languages.map((lang) => ({
        name: lang.language || lang.name,
        percentage: lang.percentage,
        count: lang.count,
    }))

    return (
        <section className="bg-bg-subtle border-border rounded-2xl border p-6 shadow-sm">
            <h3 className="text-text-primary mb-4 text-lg font-bold">Languages</h3>
            <div className="bg-bg-muted mb-6 flex h-2.5 w-full overflow-hidden rounded-full">
                {normalized.map((lang, index) => (
                    <div
                        key={lang.name}
                        className={LANGUAGE_COLORS[index] || 'bg-text-muted'}
                        style={{ width: `${lang.percentage}%` }}
                    />
                ))}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {normalized.map((lang, index) => (
                    <div key={lang.name} className="flex items-center justify-between">
                        <span className="text-text-secondary flex items-center text-xs font-semibold">
                            <Dot
                                className={LANGUAGE_COLORS[index] || 'text-text-muted'}
                                size={24}
                            />
                            {lang.name}
                        </span>
                        <span className="text-text-muted text-[10px] font-bold">
                            {lang.count
                                ? `${lang.count} (${lang.percentage}%)`
                                : `${lang.percentage}%`}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    )
}
