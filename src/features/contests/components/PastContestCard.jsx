import React from 'react'

const PastContestCard = ({ contest }) => {
    return (
        <div className="bg-bg-subtle/50 border-border/50 hover:bg-bg-subtle flex items-center justify-between rounded-xl border p-6 transition-all">
            <div className="flex items-center gap-6">
                <div className="bg-bg-page border-border hidden h-16 w-16 flex-col items-center justify-center rounded-xl border sm:flex">
                    <span className="material-symbols-outlined text-2xl text-amber-500">
                        emoji_events
                    </span>
                    <span className="text-text-primary text-[10px] font-bold uppercase">Ended</span>
                </div>
                <div>
                    <h4 className="text-text-primary mb-1 font-bold">{contest.title}</h4>
                    <p className="text-text-muted mb-2 text-xs">
                        Ended {contest.endedTime} • {contest.participants} participants
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="bg-bg-page border-border flex h-5 w-5 items-center justify-center rounded-full border text-[10px]">
                            🏆
                        </div>
                        <span className="text-text-muted text-xs font-medium">
                            Winner: <span className="text-text-primary">{contest.winner}</span>
                        </span>
                    </div>
                </div>
            </div>
            <button className="border-border text-text-secondary hover:bg-bg-page hover:text-text-primary rounded-lg border px-4 py-2 text-sm font-semibold transition-all">
                View Results
            </button>
        </div>
    )
}

export default PastContestCard
