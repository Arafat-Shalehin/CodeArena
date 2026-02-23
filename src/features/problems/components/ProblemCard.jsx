import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Activity, Flame, CheckCircle, ArrowRight } from 'lucide-react'

/**
 * @constant DIFFICULTY_CONFIG
 * @description Configuration for difficulty visualization (color & icon).
 */
const DIFFICULTY_CONFIG = {
    Easy: {
        variant: 'success',
        icon: Zap,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
    },
    Medium: {
        variant: 'warning',
        icon: Activity,
        color: 'text-amber-500',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
    },
    Hard: {
        variant: 'destructive',
        icon: Flame,
        color: 'text-rose-500',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
    },
}

export default function ProblemCard({ title, difficulty, solvedCount, tags, successRate }) {
    const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.Easy
    const Icon = config.icon

    return (
        <Card className="matte-surface hover:border-accent/50 group cursor-pointer overflow-hidden rounded-2xl p-0 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-8">
                {/* Header: Difficulty Badge */}
                <div className="mb-4 flex items-start justify-between">
                    <Badge
                        variant="outline"
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] tracking-widest uppercase ${config.bg} ${config.color} ${config.border}`}
                    >
                        <Icon className="h-3 w-3" strokeWidth={3} />
                        {difficulty}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {solvedCount}
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-text-primary group-hover:text-accent font-display mb-3 text-xl font-bold tracking-tight transition-colors">
                    {title}
                </h3>

                {/* Tags */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                        <span
                            key={i}
                            className="rounded bg-zinc-100 px-2 py-1 text-[10px] font-medium text-zinc-500 transition-colors hover:bg-zinc-200"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Footer: Success Rate & Action */}
                <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-4">
                    <span className="text-xs font-medium text-zinc-400">
                        <span className="font-bold text-zinc-600">{successRate}</span> Success
                    </span>
                    <ArrowRight className="group-hover:text-accent h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-1" />
                </div>
            </CardContent>
        </Card>
    )
}
