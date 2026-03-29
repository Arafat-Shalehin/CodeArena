import React from 'react'
import { Trophy, ChevronRight, Users, Calendar, Clock } from 'lucide-react'

function formatEndDate(dateString) {
    if (!dateString) return ''
    const end = new Date(dateString)
    const now = new Date()
    const diffMs = now - end
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 14) return 'Last week'
    return end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getDurationMinutes(start, end) {
    if (!start || !end) return null
    return Math.round((new Date(end) - new Date(start)) / 1000 / 60)
}

const PastContestCard = ({ contest }) => {
    const duration = getDurationMinutes(contest.startTime, contest.endTime)
    const problemCount = contest.problemIds?.length || 0

    return (
        <div className="card-hover group border-border bg-bg-subtle/50 hover:bg-bg-subtle flex h-full flex-col justify-between rounded-xl border p-5 transition-all">
            <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <h4 className="text-text-primary group-hover:text-accent mb-2 line-clamp-1 text-lg font-bold transition-colors">
                        {contest.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="text-text-secondary flex items-center gap-1">
                            <Calendar className="size-3.5" />
                            Ended {formatEndDate(contest.endTime)}
                        </span>
                        {duration && (
                            <span className="text-text-secondary flex items-center gap-1">
                                <Clock className="size-3.5" />
                                {duration} min
                            </span>
                        )}
                    </div>
                </div>
                <div className="bg-bg-page border-border text-text-muted group-hover:text-accent group-hover:border-accent/30 group-hover:bg-accent/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border transition-colors">
                    <Trophy className="size-5" />
                </div>
            </div>

            <div className="border-border mt-auto flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-3">
                    <span className="text-text-muted flex items-center gap-1.5 text-xs font-medium">
                        <Users className="size-3.5" />
                        {contest.maxParticipants ? `${contest.maxParticipants} max` : 'Open'}
                    </span>
                    <span className="text-text-muted text-xs">
                        · {problemCount} problem{problemCount !== 1 ? 's' : ''}
                    </span>
                </div>
                <button className="text-text-secondary hover:text-accent flex items-center gap-1 text-xs font-bold tracking-wider uppercase transition-colors">
                    View Results
                    <ChevronRight className="size-4" />
                </button>
            </div>
        </div>
    )
}

export default PastContestCard
