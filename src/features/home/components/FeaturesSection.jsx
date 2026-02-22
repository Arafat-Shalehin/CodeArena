import React from 'react';
import { Card } from '@/components/ui/card';

// Data
import { featuresData } from '../data/features.data';

/**
 * @component FeaturesSection
 * @description Displays key platform value propositions in a bento-grid style layout.
 * Highlights the "Built for Engineers" messaging with icon-based features.
 */
export default function FeaturesSection() {
    return (
        <section className="py-24 max-w-7xl mx-auto px-4">
            {/* Section Header */}
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-display font-bold text-text-main mb-6 tracking-tight">
                    Built for <span className="text-primary italic">engineers.</span>
                </h2>
                <p className="text-text-muted max-w-2xl mx-auto leading-relaxed">
                    Everything you need to sharpen your coding skills and compete globally. 
                    A platform built with performance and precision in mind.
                </p>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {featuresData.map((feature, idx) => (
                    <Card 
                        key={idx} 
                        className="p-4 md:p-8 transition-all hover:border-primary/50 flex flex-col items-start bg-white border-border-base shadow-sm group"
                    >
                        <div className="size-8 md:size-12 rounded-lg md:rounded-xl bg-primary/5 flex items-center justify-center mb-3 md:mb-6 group-hover:bg-primary/10 transition-colors">
                            <span className="material-symbols-outlined text-primary text-lg md:text-2xl group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </span>
                        </div>
                        <h3 className="text-sm md:text-xl font-display font-bold md:font-extrabold text-text-main mb-1 md:mb-3">
                            {feature.title}
                        </h3>
                        <p className="text-text-muted text-xs md:text-sm leading-relaxed">
                            {feature.desc}
                        </p>
                    </Card>
                ))}
            </div>
        </section>
    );
}