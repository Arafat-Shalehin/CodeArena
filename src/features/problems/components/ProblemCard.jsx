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
        icon: Zap,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        border: "border-emerald-200"
    },
    Medium: {
        icon: Activity,
        color: "text-amber-500",
        bg: "bg-amber-50",
        border: "border-amber-200"
    },
    Hard: {
        icon: Flame,
        color: "text-rose-500",
        bg: "bg-rose-50",
        border: "border-rose-200"
    }
};

/**
 * @component ProblemCard
 * @description Displays a summary card for a coding problem with difficulty visualization.
 */
export default function ProblemCard({ title, difficulty, solvedCount, tags, successRate }) {
    const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.Easy;
    const Icon = config.icon;

    return (
        <Card className="matte-surface p-0 rounded-2xl hover:border-primary/50 transition-all cursor-pointer group shadow-sm overflow-hidden hover:shadow-md border-border-base">
            <CardContent className="p-8 flex flex-col h-full">
                
                {/* Header: Difficulty Badge & Solved Count */}
                <div className="flex justify-between items-start mb-4">
                    <Badge
                        variant="outline"
                        className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 border ${config.bg} ${config.color} ${config.border}`}
                    >
                        <Icon className="w-3 h-3" strokeWidth={3} />
                        {difficulty}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-text-muted text-xs font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {solvedCount}
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-text-main mb-3 group-hover:text-primary transition-colors font-display tracking-tight leading-tight">
                    {title}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {tags.map((tag, i) => (
                        <span 
                            key={i} 
                            className="text-[10px] font-medium text-text-muted bg-surface hover:bg-zinc-200 px-2.5 py-1 rounded-md transition-colors border border-border-base/50"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Footer: Success Rate & Action */}
                <div className="flex items-center justify-between pt-4 border-t border-border-base mt-auto">
                    <span className="text-xs text-text-muted font-medium">
                        <span className="font-bold text-text-main">{successRate}</span> Success Rate
                    </span>
                    
                    <div className="flex items-center gap-2">
                        {/* Hover-only 'Solve' text for better UX */}
                        <span className="text-primary text-xs font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            Solve
                        </span>
                        <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-all group-hover:translate-x-1" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}