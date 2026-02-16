import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * @constant DIFFICULTY_VARIANTS
 * @description Map difficulty levels to Badge variants.
 */
const DIFFICULTY_VARIANTS = {
    Easy: "success",
    Medium: "warning",
    Hard: "destructive"
};

/**
 * @component ProblemCard
 * @description Displays a summary card for a coding problem.
 * Includes difficulty badge, title, tags, and success rate metrics.
 * 
 * @param {Object} props
 * @param {string} props.title - The title of the problem.
 * @param {string} props.difficulty - Difficulty level ("Easy", "Medium", "Hard").
 * @param {string} props.solvedCount - Number of users who solved it (e.g., "1.2k").
 * @param {string} props.tags - Array of related topic tags.
 * @param {string} props.successRate - Percentage of successful submissions.
 */
export default function ProblemCard({ title, difficulty, solvedCount, tags, successRate }) {
    const badgeVariant = DIFFICULTY_VARIANTS[difficulty] || "secondary";

    return (
        // Using matte-surface utility class on the Card for the glass effect
        <Card className="matte-surface p-0 rounded-2xl hover:border-primary/50 transition-all cursor-pointer group shadow-sm overflow-hidden">
            <CardContent className="p-8">
                {/* Header: Difficulty Badge */}
                <div className="flex justify-between items-start mb-4">
                    <Badge variant={badgeVariant} className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded">
                        {difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-zinc-400 text-xs font-medium">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        {solvedCount}
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-text-main mb-3 group-hover:text-primary transition-colors font-display">
                    {title}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] font-normal text-zinc-500 bg-zinc-100 hover:bg-zinc-200">
                            {tag}
                        </Badge>
                    ))}
                </div>

                {/* Footer: Success Rate & Action */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-auto">
                    <span className="text-xs text-zinc-400">
                        <span className="font-bold text-zinc-600">{successRate}</span> Success
                    </span>
                    <span className="material-symbols-outlined text-zinc-300 group-hover:text-primary transition-colors">
                        arrow_forward
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
