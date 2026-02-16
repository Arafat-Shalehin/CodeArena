import React from 'react';

// Data
import { stepsData } from '../data/steps.data';

/**
 * @component HowItWorksSection
 * @description Visualizes the user journey steps from joining to competing.
 * Uses a horizontal dashed line connector on desktop to indicate flow.
 * 
 * @returns {JSX.Element} The rendered How It Works section.
 */
export default function HowItWorksSection() {
    return (
        <section className="py-12 bg-secondary/30 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <h2 className="text-center text-4xl font-display font-extrabold text-text-main mb-12 italic">
                    How It <span className="text-primary italic">Works.</span>
                </h2>

                {/* Steps Flow */}
                <div className="relative">
                    {/* Connecting Line (Desktop Only) */}
                    <div className="absolute top-8 left-0 w-full h-[1px] bg-zinc-100 hidden md:block border-b border-dashed border-zinc-200"></div>

                    {/* Mobile Vertical Flow (lg:hidden) */}
                    <div className="lg:hidden space-y-8 relative text-left">
                        {/* Vertical Connector Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-zinc-200"></div>

                        {stepsData.map((item, idx) => (
                            <div key={idx} className="relative pl-16">
                                <div className="absolute left-0 size-12 bg-white border-2 border-zinc-200 rounded-full flex items-center justify-center font-display font-bold text-lg shadow-sm z-10 text-text-main">
                                    {item.step}
                                </div>
                                <h4 className="font-display font-extrabold text-lg text-text-main mb-1">{item.title}</h4>
                                <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Horizontal Flow (hidden lg:grid) */}
                    <div className="hidden lg:grid md:grid-cols-4 gap-12">
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
