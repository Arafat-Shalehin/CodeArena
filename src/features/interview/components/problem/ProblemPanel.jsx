import React from 'react'
import { Clock, Tag, Star, Loader2 } from 'lucide-react'

const DIFFICULTY_STYLES = {
    easy: 'text-[#00b8a3] bg-[#00b8a3]/10',
    medium: 'text-[#ffc01e] bg-[#ffc01e]/10',
    hard: 'text-[#ff375f] bg-[#ff375f]/10',
}

function ProblemPanel({ problem }) {
    if (!problem) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 size={24} className="text-accent animate-spin" />
            </div>
        )
    }

    return (
        <div className="h-full overflow-y-auto p-5 text-sm">
            {/* Title + difficulty */}
            <h2 className="text-text-primary mb-2 text-xl font-bold">{problem.title}</h2>
            <div className="mb-4 flex flex-wrap gap-2">
                <span
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                        DIFFICULTY_STYLES[problem.difficulty] || ''
                    }`}
                >
                    {problem.difficulty}
                </span>
                {problem.tags?.map((tag) => (
                    <span
                        key={tag}
                        className="bg-bg-muted text-text-secondary flex items-center gap-1 rounded-full px-3 py-1 text-[11px]"
                    >
                        <Tag size={11} />
                        {tag}
                    </span>
                ))}
            </div>

            {/* Limits */}
            <div className="border-border bg-bg-page/50 text-text-secondary mb-5 flex items-center gap-5 rounded-xl border p-3 text-[12px]">
                <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-accent" />
                    {problem.timeLimit}ms
                </span>
                <span className="flex items-center gap-1.5">
                    <Star size={13} className="text-accent" />
                    {Math.round((problem.memoryLimit || 0) / 1024)}MB
                </span>
            </div>

            {/* Description */}
            <div className="text-text-secondary prose-markdown mb-6 leading-relaxed">
                {problem.description}
            </div>

            {/* Sample test cases */}
            {problem.sampleTestCases?.length > 0 && (
                <div className="space-y-5">
                    {problem.sampleTestCases.map((tc, i) => (
                        <div key={i}>
                            <h4 className="text-text-primary mb-2 text-[13px] font-bold">
                                Example {i + 1}:
                            </h4>
                            <div className="border-border overflow-hidden rounded-xl border font-mono text-[12px]">
                                <div className="bg-bg-muted text-text-muted border-border border-b px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase">
                                    Input
                                </div>
                                <div className="text-text-primary p-4 whitespace-pre-wrap">
                                    {tc.input}
                                </div>
                                <div className="bg-bg-muted text-text-muted border-border border-y px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase">
                                    Output
                                </div>
                                <div className="text-text-primary p-4 whitespace-pre-wrap">
                                    {tc.output}
                                </div>
                                {tc.explanation && (
                                    <>
                                        <div className="bg-bg-muted text-text-muted border-border border-y px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase">
                                            Explanation
                                        </div>
                                        <div className="text-text-secondary p-4 whitespace-pre-wrap italic">
                                            {tc.explanation}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default React.memo(ProblemPanel)
