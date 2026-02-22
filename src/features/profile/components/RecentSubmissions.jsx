import { submissions } from '../data/submissions.data';

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
      <div className="p-8 text-center border-t border-border">
        <p className="text-sm text-text-muted">No recent submissions</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {submissions.map((item) => (
        <div
          key={item.id}
          className="p-4 flex justify-between items-center hover:bg-bg-muted/50 transition-colors"
        >
          <div className="flex gap-4 items-center">
            {/* Status Icon */}
            <span
              className={
                item.status === 'Accepted' ? 'text-success' : 'text-error'
              }
            >
              {item.status === 'Accepted' ? '●' : '■'}
            </span>
            <div>
              <p className="text-sm font-semibold text-text-primary font-mono">
                {item.title}
              </p>
              <p className="text-xs text-text-muted">
                {item.time} • {item.lang}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.status === 'Accepted'
              ? 'bg-success-light text-success'
              : 'bg-error-light text-error'
              }`}
          >
            {item.status}
          </span>
        </div>
      ))}
    </div>
  );
}

RecentSubmissions.displayName = 'RecentSubmissions';
