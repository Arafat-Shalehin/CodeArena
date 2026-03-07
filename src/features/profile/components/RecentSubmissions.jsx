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
                const isAccepted = item.verdict === 'accepted'
                const statusLabel = isAccepted
                    ? 'Accepted'
                    : item.verdict?.replace('_', ' ')?.toUpperCase() || 'FAILED'

                return (
                    <div
                        key={item._id}
                        className="hover:bg-bg-muted/50 flex items-center justify-between p-4 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            {/* Status Icon */}
                            <span className={isAccepted ? 'text-success' : 'text-error'}>
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
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                isAccepted
                                    ? 'bg-success-light text-success'
                                    : 'bg-error-light text-error'
                            }`}
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
