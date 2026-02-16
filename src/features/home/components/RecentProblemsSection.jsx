import React from 'react';
import { problemsData } from '../../problems/data/problems.data';
import ProblemCard from '../../problems/components/ProblemCard';
import Button from '../../../shared/components/ui/Button';

/**
 * RecentProblemsSection Component
 * 
 * Displays a grid of curated coding problems.
 * Fetches data from shared problem data source.
 * 
 * @returns {JSX.Element} The rendered problems section.
 */
export default function RecentProblemsSection() {
    return (
        <section className="py-24 max-w-7xl mx-auto px-4">
            {/* Section Header with Action */}
            <div className="flex items-end justify-between mb-16 border-b border-border-base pb-8">
                <div className="max-w-xl">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-text-main mb-4 tracking-tight">
                        Curated <span className="text-primary italic">challenges.</span>
                    </h2>
                    <p className="text-text-muted text-sm leading-relaxed">
                        A hand-picked selection of problems designed to sharpen your algorithmic intuition. No fluff, just pure logic.
                    </p>
                </div>

                <Button variant="outline" size="sm" className="bg-white hover:bg-zinc-50 border-zinc-200">
                    All problems
                    <span className="material-symbols-outlined text-sm">north_east</span>
                </Button>
            </div>

            {/* Problems Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {problemsData.map((problem, idx) => (
                    <ProblemCard key={idx} {...problem} />
                ))}
            </div>
        </section>
    );
}
