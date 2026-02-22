import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';

/**
 * @component CodeEditorPreview
 * @description A visual representation of a code editor with a Python solution.
 */
export default function CodeEditorPreview({ className }) {
    return (
        <div className={cn("relative group", className)}>
            {/* Background Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/5 to-transparent rounded-[2rem] blur-2xl"></div>

            {/* Editor Container */}
            <div className="relative matte-surface border-zinc-200/50 rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:-translate-y-2">

                {/* Editor Title Bar */}
                <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
                    {/* Window Controls */}
                    <div className="flex gap-1.5">
                        <div className="size-2.5 rounded-full bg-zinc-300"></div>
                        <div className="size-2.5 rounded-full bg-zinc-300"></div>
                        <div className="size-2.5 rounded-full bg-zinc-300"></div>
                    </div>

                    {/* Filename */}
                    <div className="text-[10px] font-mono text-zinc-400">solution.py — CodeArena</div>

                    {/* Settings Icon */}
                    <div className="flex gap-3">
                        <span className="material-symbols-outlined text-zinc-300 text-sm">settings</span>
                    </div>
                </div>

                {/* Editor Content */}
                <div className="p-8 font-mono text-[13px] leading-relaxed text-zinc-700 bg-white">
                    {/* Line 1 */}
                    <div className="flex gap-4">
                        <span className="text-zinc-300 text-right select-none w-4">1</span>
                        <span><span className="text-primary font-bold">def</span> <span className="text-indigo-500">solve_challenge</span>(data):</span>
                    </div>

                    {/* Line 2 */}
                    <div className="flex gap-4">
                        <span className="text-zinc-300 text-right select-none w-4">2</span>
                        <span className="pl-4"><span className="text-zinc-400"># Apply optimized binary search</span></span>
                    </div>

                    {/* Line 3 */}
                    <div className="flex gap-4">
                        <span className="text-zinc-300 text-right select-none w-4">3</span>
                        <span className="pl-4">left, right = <span className="text-emerald-600">0</span>, <span className="text-emerald-600">len</span>(data)</span>
                    </div>

                    {/* Line 4 */}
                    <div className="flex gap-4">
                        <span className="text-zinc-300 text-right select-none w-4">4</span>
                        <span className="pl-4"><span className="text-primary font-bold">while</span> left &lt; right:</span>
                    </div>

                    {/* Line 5 */}
                    <div className="flex gap-4">
                        <span className="text-zinc-300 text-right select-none w-4">5</span>
                        <span className="pl-8 text-zinc-400">...</span>
                    </div>

                    {/* Editor Footer / Status Bar */}
                    <div className="mt-8 flex justify-between items-center border-t border-zinc-100 pt-6">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">PASS 24/24</span>
                            <span className="text-[10px] text-zinc-400">1.2ms latency</span>
                        </div>
                        <button className="bg-primary/10 text-primary px-3 py-1 rounded text-[10px] font-bold hover:bg-primary/20 transition-colors cursor-pointer">
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

CodeEditorPreview.propTypes = {
    className: PropTypes.string,
};