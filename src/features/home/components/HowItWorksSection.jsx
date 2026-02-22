import React from 'react';
import { Card } from '@/components/ui/card';

// Data
import { stepsData } from '../data/steps.data';

/**
 * @component HowItWorksSection
 * @description Visualizes the user journey steps from joining to competing.
 * Features a vertical timeline on mobile and a dashed horizontal flow on desktop.
 */
export default function HowItWorksSection() {
    return (
        <section className="py-20 bg-surface/50 overflow-hidden border-t border-border-base">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <h2 className="text-center text-4xl font-display font-extrabold text-text-main mb-16 italic">
                    How It <span className="text-primary italic">Works.</span>
                </h2>

                {/* Steps Flow Container */}
                <div className="relative">
                    
                    {/* --- MOBILE VIEW (Vertical Timeline) --- */}
                    <div className="lg:hidden space-y-12 relative text-left max-w-md mx-auto">
                        {/* Vertical Connector Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-px bg-border-base border-l border-dashed border-primary/30"></div>

                        {stepsData.map((item, idx) => (
                            <div key={idx} className="relative pl-16 group">
                                <div className="absolute left-0 size-12 bg-background border-2 border-primary/20 rounded-xl flex items-center justify-center font-display font-black text-lg shadow-sm z-10 text-primary group-hover:border-primary transition-colors">
                                    {item.step}
                                </div>
                                <div>
                                    <h4 className="font-display font-extrabold text-xl text-text-main mb-2">{item.title}</h4>
                                    <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* --- DESKTOP VIEW (Horizontal Flow) --- */}
                    <div className="hidden lg:block relative">
                        {/* Connecting Dashed Line */}
                        <div className="absolute top-8 left-0 w-full h-px border-b border-dashed border-border-base"></div>

                        <div className="grid grid-cols-4 gap-8">
                            {stepsData.map((item, idx) => (
                                <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
                                    {/* Step Number Circle */}
                                    <div className="size-16 rounded-2xl bg-background border border-border-base flex items-center justify-center text-xl font-display font-black text-text-main mb-8 shadow-sm group-hover:border-primary/50 group-hover:text-primary transition-all duration-300">
                                        {item.step}
                                    </div>

                                    {/* Step Details */}
                                    <h4 className="text-lg font-display font-extrabold text-text-main mb-3">{item.title}</h4>
                                    <p className="text-text-muted text-xs leading-relaxed max-w-[200px]">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}