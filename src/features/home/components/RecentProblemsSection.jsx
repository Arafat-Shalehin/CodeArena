import React from 'react';
import { ArrowUpRight } from 'lucide-react';

// Shared Components
import { Button } from '@/components/ui/button';

// Feature Components
import ProblemCard from '@/features/problems/components/ProblemCard';

// Data
import { problemsData } from '@/features/problems/data/problems.data';

/**
 * @component RecentProblemsSection
 * @description Displays a grid of curated coding problems.
 */
export default function RecentProblemsSection() {
    return (
        <section className="py-24 max-w-7xl mx-auto px-4">
            
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 border-b border-border-base pb-8">
                <div className="max-w-xl">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-text-main mb-4 tracking-tight">
                        Curated <span className="text-primary italic">challenges.</span>
                    </h2>
                    <p className="text-text-muted text-sm leading-relaxed">
                        A hand-picked selection of problems designed to sharpen your algorithmic intuition. 
                        No fluff, just pure logic.
                    </p>
                </div>
            </div>

            {/* Problems Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {problemsData.map((problem, idx) => (
                    <ProblemCard key={idx} {...problem} />
                ))}
            </div>

            {/* View All Problems Button */}
            <div className="mt-12 text-center">
                <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto bg-background hover:bg-surface border-border-base text-text-muted hover:text-primary hover:border-primary/20 transition-all duration-300 group"
                >
                    View all problems
                    <ArrowUpRight className="w-4 h-4 ml-2 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
            </div>
        </section>
    );
}