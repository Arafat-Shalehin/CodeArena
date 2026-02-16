import React from 'react';

// Data
import { featuresData } from '../data/features.data';

/**
 * @component FeaturesSection
 * @description Displays key platform value propositions in a bento-grid style layout.
 * Highlights the "Built for Engineers" messaging with icon-based features.
 * 
 * @returns {JSX.Element} The rendered Features section.
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
                    Everything you need to sharpen your coding skills and compete globally. A platform built with performance and precision in mind.
                </p>
            </div>

            {/* Grid Layout */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuresData.map((feature, idx) => (
                    <div key={idx} className="p-8 rounded-2xl bg-white border border-border-base hover:border-primary/50 transition-all group shadow-sm flex flex-col items-start">
                        <div className="size-12 rounded-xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                            <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </span>
                        </div>
                        <h3 className="text-xl font-display font-extrabold text-text-main mb-3">{feature.title}</h3>
                        <p className="text-text-muted text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
