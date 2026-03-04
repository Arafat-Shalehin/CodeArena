'use client'

import Link from 'next/link'

const TAG_BASE = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium'

export const TAG_VARIANTS = {
    highlight: `${TAG_BASE} bg-accent-light text-accent-text`,
    default: `${TAG_BASE} bg-bg-muted text-text-secondary`,
}

/**
 * Reusable problem card used across the platform.
 * @param {Object} props
 * @param {Object} props.problem - Problem data (title, difficulty, tags, acceptanceRate, _id)
 * @param {string[]} [props.highlightTags] - Tags to visually highlight
 * @param {string} [props.badge] - Optional badge text (e.g. "New!")
 */
export default function ProblemCard({ problem, highlightTags = [], badge }) {
    return (
        <Link
            href={`/problems/${problem._id}`}
            className="bg-bg-page border-border duration-normal relative flex flex-col justify-between rounded-lg border p-4 shadow-sm transition-shadow hover:shadow"
        >
            {badge && (
                <span className="bg-accent absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    {badge}
                </span>
            )}
            <div>
                <div className="mb-2 flex items-start justify-between">
                    <h4 className="text-text-primary line-clamp-1 text-sm font-semibold">
                        {problem.title}
                    </h4>
                    <span
                        className={`ml-2 inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            problem.difficulty === 'easy'
                                ? 'bg-success-light text-success'
                                : problem.difficulty === 'medium'
                                  ? 'bg-warning-light text-warning'
                                  : 'bg-error-light text-error'
                        }`}
                    >
                        {problem.difficulty}
                    </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                    {problem.tags &&
                        problem.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className={
                                    highlightTags.includes(tag)
                                        ? TAG_VARIANTS.highlight
                                        : TAG_VARIANTS.default
                                }
                            >
                                {tag}
                            </span>
                        ))}
                    {problem.tags?.length > 3 && (
                        <span className={TAG_VARIANTS.default}>+{problem.tags.length - 3}</span>
                    )}
                </div>
            </div>

            <div className="text-text-muted mt-4 flex items-center justify-between text-xs">
                <span>{problem.acceptanceRate || 0}% Acceptance</span>
            </div>
        </Link>
    )
}
