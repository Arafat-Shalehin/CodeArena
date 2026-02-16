import React from 'react';
import { stepsData } from '../data/steps.data';

/**
 * HowItWorksSection Component
 * 
 * Visualizes the user journey steps.
 * Uses a dashed line design to connect the steps.
 * 
 * @returns {JSX.Element} The rendered How It Works section.
 */
export default function HowItWorksSection() {
    return (
        <section className="py-24 bg-secondary/30 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <h2 className="text-center text-4xl font-display font-extrabold text-text-main mb-20 italic">
                    How It <span className="text-primary italic">Works.</span>
                </h2>

                {/* Steps Flow */}
                <div className="relative">
                    {/* Connecting Line (Desktop Only) */}
                    <div className="absolute top-8 left-0 w-full h-[1px] bg-zinc-100 hidden md:block border-b border-dashed border-zinc-200"></div>

                    <div className="grid md:grid-cols-4 gap-12">
                        {stepsData.map((item, idx) => (
                            <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
                                {/* Step Number Circle */}
                                <div className="size-16 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-xl font-display font-black text-text-main mb-8 shadow-sm group-hover:border-primary/50 transition-colors">
                                    {item.step}
                                </div>

                                {/* Step Details */}
                                <h4 className="text-lg font-display font-extrabold text-text-main mb-3">{item.title}</h4>
                                <p className="text-text-muted text-xs leading-relaxed max-w-[180px]">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
