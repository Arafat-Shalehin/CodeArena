import { submissions } from '../data/submissions.data'

/**
 * @component RecentSubmissions
 * @description Displays a list of the user's recent problem submissions with
 * status indicators (Accepted/Wrong Answer) and metadata (time, language).
 *
 * @returns {JSX.Element} The rendered recent submissions list.
 */
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
            {submissions.map((item) => (
                <div
                    key={item.id}
                    className="hover:bg-bg-muted/50 flex items-center justify-between p-4 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        {/* Status Icon */}
                        <span
                            className={item.status === 'Accepted' ? 'text-success' : 'text-error'}
                        >
                            {item.status === 'Accepted' ? '●' : '■'}
                        </span>
                        <div>
                            <p className="text-text-primary font-mono text-sm font-semibold">
                                {item.title}
                            </p>
                            <p className="text-text-muted text-xs">
                                {item.time} • {item.lang}
                            </p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                            item.status === 'Accepted'
                                ? 'bg-success-light text-success'
                                : 'bg-error-light text-error'
                        }`}
                    >
                        {item.status}
                    </span>
                </div>
            ))}
        </div>
    )
}

RecentSubmissions.displayName = 'RecentSubmissions'
