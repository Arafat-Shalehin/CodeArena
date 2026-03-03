import React from 'react'
import { Trophy, ChevronRight } from 'lucide-react'

const PastContestCard = ({ contest }) => {
    return (
        <div className="card-hover group border-border bg-bg-subtle/50 hover:bg-bg-subtle flex flex-col justify-between rounded-xl border p-5 transition-all">
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="text-text-primary group-hover:text-accent mb-2 line-clamp-1 text-lg font-bold transition-colors">
                        {contest.title}
                    </h4>
                    <p className="text-text-secondary mb-4 text-xs font-semibold">
                        Ended on {contest.endedTime} • {contest.participants} participants
                    </p>
                </div>
                <div className="bg-bg-page border-border text-text-muted group-hover:text-accent group-hover:border-accent/30 group-hover:bg-accent/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border transition-colors">
                    <Trophy className="size-6" />
                </div>
            </div>

            <div className="border-border mt-2 flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-2">
                    <div className="bg-bg-page ring-border/50 flex h-6 w-6 items-center justify-center rounded-full text-[10px] shadow-sm ring-1">
                        🏆
                    </div>
                    <span className="text-text-muted text-xs font-medium">
                        Winner: <span className="text-text-primary ml-1">{contest.winner}</span>
                    </span>
                </div>
                <button className="text-text-secondary hover:text-accent flex items-center gap-1 text-xs font-bold tracking-wider uppercase transition-colors">
                    Results
                    <ChevronRight className="size-4 text-center" />
                </button>
            </div>
        </div>
    )
}

export default PastContestCard
