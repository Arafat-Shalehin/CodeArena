import { submissions } from '../data/submissions.data'

/**
 * @component RecentSubmissions
 * @description Displays a list of the user's recent problem submissions with
 * status indicators (Accepted/Wrong Answer) and metadata (time, language).
 *
 * @returns {JSX.Element} The rendered recent submissions list.
 */
import { formatDistanceToNow } from 'date-fns'

export default function RecentSubmissions({ submissions = [] }) {
    if (!submissions || submissions.length === 0) {
        return (
            <div className="border-border border-t p-8 text-center">
                <p className="text-text-muted text-sm">No recent submissions</p>
            </div>
        )
    }

    return (
        <div className="divide-border divide-y">
            {submissions.map((item) => {
                const verdictRaw = (item.verdict || '').toLowerCase()
                const isAccepted = verdictRaw === 'accepted'
                const statusLabel = isAccepted
                    ? 'Accepted'
                    : item.verdict?.replace(/_/g, ' ')?.toUpperCase() || 'FAILED'

                const getBadgeColor = (v) => {
                    if (v === 'accepted') return 'bg-success-light text-success'
                    if (v === 'time_limit_exceeded') return 'bg-warning-light text-warning'
                    if (
                        [
                            'wrong_answer',
                            'runtime_error',
                            'compilation_error',
                            'system_error',
                        ].includes(v)
                    ) {
                        return 'bg-error-light text-error'
                    }
                    return 'bg-bg-muted text-text-muted'
                }

                const getDotColor = (v) => {
                    if (v === 'accepted') return 'text-success'
                    if (v === 'time_limit_exceeded') return 'text-warning'
                    if (
                        [
                            'wrong_answer',
                            'runtime_error',
                            'compilation_error',
                            'system_error',
                        ].includes(v)
                    ) {
                        return 'text-error'
                    }
                    return 'text-text-muted'
                }

                return (
                    <div
                        key={item._id}
                        className="hover:bg-bg-muted/50 flex items-center justify-between p-4 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            {/* Status Icon */}
                            <span className={getDotColor(verdictRaw)}>
                                {isAccepted ? '●' : '■'}
                            </span>
                            <div>
                                <p className="text-text-primary font-mono text-sm font-semibold">
                                    {item.problemId?.title || 'Unknown Problem'}
                                </p>
                                <p className="text-text-muted text-[10px] font-medium uppercase">
                                    {item.createdAt
                                        ? formatDistanceToNow(new Date(item.createdAt), {
                                              addSuffix: true,
                                          })
                                        : '—'}{' '}
                                    • {item.language}
                                </p>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${getBadgeColor(verdictRaw)}`}
                        >
                            {statusLabel}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

RecentSubmissions.displayName = 'RecentSubmissions'
