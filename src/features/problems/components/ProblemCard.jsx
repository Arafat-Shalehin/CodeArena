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
        color: 'text-success',
        bg: 'bg-success-light',
        border: 'border-success/30',
    },
    Medium: {
        variant: 'warning',
        icon: Activity,
        color: 'text-warning',
        bg: 'bg-warning-light',
        border: 'border-warning/30',
    },
    Hard: {
        variant: 'destructive',
        icon: Flame,
        color: 'text-error',
        bg: 'bg-error-light',
        border: 'border-error/30',
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
                    <div className="text-text-muted flex items-center gap-1.5 text-xs font-medium">
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
                            className="bg-bg-muted text-text-secondary hover:bg-border rounded px-2 py-1 text-[10px] font-medium transition-colors"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Footer: Success Rate & Action */}
                <div className="border-border mt-auto flex items-center justify-between border-t pt-4">
                    <span className="text-text-muted text-xs font-medium">
                        <span className="text-text-primary font-bold">{successRate}</span> Success
                    </span>
                    <ArrowRight className="group-hover:text-accent text-text-muted/60 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
            </CardContent>
        </Card>
    )
}
