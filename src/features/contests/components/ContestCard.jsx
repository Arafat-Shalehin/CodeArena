import React from 'react'

const ContestCard = ({ title, date, duration, difficulty, participants, type = 'Registering' }) => {
    const isPro = type === 'Pro Event'

    // Theme-aligned classes from globals.css
    // Note: We use the existing design system tokens for backgrounds and text.

    return (
        <div
            className={`card-hover group border-border bg-bg-subtle transition-all ${isPro ? 'border-l-accent border-l-4' : ''}`}
        >
            <div className="mb-4 flex items-start justify-between">
                <div
                    className={`${isPro ? 'bg-accent/10 text-accent' : 'bg-bg-muted text-text-secondary'} rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase`}
                >
                    {type}
                </div>
                <span className="material-symbols-outlined text-text-muted group-hover:text-accent transition-colors">
                    {isPro ? 'stars' : 'bookmark'}
                </span>
            </div>
            <h4
                className={`text-text-primary mb-4 line-clamp-1 text-lg font-bold ${isPro ? 'text-accent' : ''}`}
            >
                {title}
            </h4>
            <div className="mb-6 space-y-3">
                <div className="text-text-secondary flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-sm">calendar_today</span> {date}
                </div>
                <div className="text-text-secondary flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-sm">schedule</span> {duration}
                </div>
                <div className="text-text-secondary flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-sm">bar_chart</span>{' '}
                    {difficulty}
                </div>
                <div className="text-text-secondary flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-sm">group</span> {participants}
                </div>
            </div>
            <button
                className={`btn-primary w-full ${!isPro ? 'bg-bg-muted hover:bg-bg-subtle text-text-primary border-border border' : ''}`}
            >
                Register Now
            </button>
        </div>
    )
}

export default ContestCard
