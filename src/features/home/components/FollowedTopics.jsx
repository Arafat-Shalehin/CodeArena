'use client'

const TOPICS = ['#algorithms', '#react', '#system_design', '#python']

export default function FollowedTopics() {
    return (
        <div className="flex flex-col gap-3">
            <p className="text-text-muted px-3 text-xs font-bold tracking-wider uppercase">
                Followed Topics
            </p>
            <div className="flex flex-wrap gap-2 px-3">
                {TOPICS.map((tag) => (
                    <span
                        key={tag}
                        className="bg-bg-muted text-text-secondary hover:text-text-primary cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors"
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    )
}
