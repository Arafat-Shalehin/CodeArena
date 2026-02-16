import React from 'react';

/**
 * @constant DIFFICULTY_COLORS
 * @description Color mapping for problem difficulty levels.
 */
const DIFFICULTY_COLORS = {
    Easy: "bg-emerald-50 text-emerald-700",
    Medium: "bg-amber-50 text-amber-700",
    Hard: "bg-red-50 text-red-700"
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
 * @param {string[]} props.tags - Array of related topic tags.
 * @param {string} props.successRate - Percentage of successful submissions.
 */
export default function ProblemCard({ title, difficulty, solvedCount, tags, successRate }) {
    const difficultyClass = DIFFICULTY_COLORS[difficulty] || "bg-zinc-50 text-zinc-700";

    return (
        <div className="matte-surface p-8 rounded-2xl hover:border-primary/50 transition-all cursor-pointer group shadow-sm">
            {/* Header: Difficulty Badge */}
            <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded ${difficultyClass}`}>
                    {difficulty}
                </span>
                <div className="flex items-center gap-1 text-zinc-400 text-xs">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {solvedCount}
                </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-text-main mb-3 group-hover:text-primary transition-colors">
                {title}
            </h3>

            {/* Tags */}
            <div className="flex gap-2 mb-6">
                {tags.map((tag, i) => (
                    <span key={i} className="text-xs text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                        {tag}
                    </span>
                ))}
            </div>

            {/* Footer: Success Rate & Action */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                <span className="text-xs text-zinc-400">
                    <span className="font-bold text-zinc-600">{successRate}</span> Success
                </span>
                <span className="material-symbols-outlined text-zinc-300 group-hover:text-primary transition-colors">
                    arrow_forward
                </span>
            </div>
        </div>
    );
}
