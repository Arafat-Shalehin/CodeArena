import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Activity, Flame, CheckCircle, ArrowRight } from 'lucide-react';

/**
 * @constant DIFFICULTY_CONFIG
 * @description Configuration for difficulty visualization (color & icon).
 */
const DIFFICULTY_CONFIG = {
    Easy: {
        variant: "success",
        icon: Zap,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        border: "border-emerald-200"
    },
    Medium: {
        variant: "warning",
        icon: Activity,
        color: "text-amber-500",
        bg: "bg-amber-50",
        border: "border-amber-200"
    },
    Hard: {
        variant: "destructive",
        icon: Flame,
        color: "text-rose-500",
        bg: "bg-rose-50",
        border: "border-rose-200"
    }
};

export default function ProblemCard({ title, difficulty, solvedCount, tags, successRate }) {
    const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.Easy;
    const Icon = config.icon;

    return (
        <Card className="matte-surface p-0 rounded-2xl hover:border-primary/50 transition-all cursor-pointer group shadow-sm overflow-hidden hover:shadow-md">
            <CardContent className="p-8">
                {/* Header: Difficulty Badge */}
                <div className="flex justify-between items-start mb-4">
                    <Badge
                        variant="outline"
                        className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 border ${config.bg} ${config.color} ${config.border}`}
                    >
                        <Icon className="w-3 h-3" strokeWidth={3} />
                        {difficulty}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {solvedCount}
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-text-main mb-3 group-hover:text-primary transition-colors font-display tracking-tight">
                    {title}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {tags.map((tag, i) => (
                        <span key={i} className="text-[10px] font-medium text-zinc-500 bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded transition-colors">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Footer: Success Rate & Action */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-auto">
                    <span className="text-xs text-zinc-400 font-medium">
                        <span className="font-bold text-zinc-600">{successRate}</span> Success
                    </span>
                    <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                </div>
            </CardContent>
        </Card>
    );
}
