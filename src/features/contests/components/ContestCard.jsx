import React from 'react'
import { Calendar, Clock, BarChart2, Users, Star, Bookmark } from 'lucide-react'

function formatDate(dateString) {
    if (!dateString) return 'TBA'
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function getDurationMinutes(start, end) {
    if (!start || !end) return null
    return Math.round((new Date(end) - new Date(start)) / 1000 / 60)
}

/**
 * @component ContestCard
 * Displays a contest in the contest list grid.
 * Accepts a real contest object from /api/contests.
 */
const ContestCard = ({ contest = {} }) => {
    const {
        title = 'Untitled Contest',
        startTime,
        endTime,
        problemIds = [],
        maxParticipants,
        status = 'upcoming',
    } = contest

    const isPro = maxParticipants === null // unlimited = pro event
    const duration = getDurationMinutes(startTime, endTime)
    const Icon = isPro ? Star : Bookmark

    return (
        <div
            className={`card-hover group border-border bg-bg-subtle flex h-full flex-col rounded-lg p-6 transition-all hover:shadow ${
                isPro ? 'border-l-accent border-l-4' : 'border'
            }`}
        >
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
                <div
                    className={`${
                        isPro ? 'bg-accent/10 text-accent-text' : 'bg-bg-muted text-text-secondary'
                    } rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase`}
                >
                    {status === 'active' ? 'Live' : isPro ? 'Pro Event' : 'Registering'}
                </div>
                <Icon className="text-text-muted group-hover:text-accent size-5 transition-colors" />
            </div>

            {/* Title */}
            <h4
                className={`text-text-primary mb-4 line-clamp-1 text-lg font-bold ${isPro ? 'text-accent' : ''}`}
            >
                {title}
            </h4>

            {/* Meta */}
            <div className="mb-6 space-y-3">
                <div className="text-text-secondary flex items-center gap-3 text-sm">
                    <Calendar className="size-4 flex-shrink-0" />
                    {formatDate(startTime)}
                </div>
                {duration && (
                    <div className="text-text-secondary flex items-center gap-3 text-sm">
                        <Clock className="size-4 flex-shrink-0" />
                        {duration} min · {problemIds.length} problem
                        {problemIds.length !== 1 ? 's' : ''}
                    </div>
                )}
                {maxParticipants && (
                    <div className="text-text-secondary flex items-center gap-3 text-sm">
                        <Users className="size-4 flex-shrink-0" />
                        Max {maxParticipants} participants
                    </div>
                )}
            </div>

            {/* CTA */}
            <div
                className={`mt-auto inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                    status === 'active'
                        ? 'bg-accent hover:bg-accent-hover text-white'
                        : isPro
                          ? 'bg-accent hover:bg-accent-hover text-white'
                          : 'bg-bg-muted text-text-primary border-border hover:bg-bg-subtle border'
                }`}
            >
                {status === 'active' ? 'Enter Arena' : 'View Contest'}
            </div>
        </div>
    )
}

export default ContestCard
