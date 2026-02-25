import PropTypes from 'prop-types'
import { cn } from '@/lib/utils'

/**
 * @component CodeEditorPreview
 * @description A visual representation of a code editor with a Python solution.
 * Used in the Hero section to emphasize the coding-centric nature of the platform.
 * Features:
 * - Syntax highlighting simulation
 * - Line numbers and status bar
 * - Glassmorphism effects
 *
 * @returns {JSX.Element} The rendered code editor visualization.
 */
export default function CodeEditorPreview({ className }) {
    return (
        <div className={cn('group relative', className)}>
            {/* Background Glow Effect */}
            <div className="from-accent/5 absolute -inset-4 rounded-[2rem] bg-gradient-to-tr to-transparent blur-2xl"></div>

            {/* Editor Container */}
            <div className="matte-surface relative overflow-hidden rounded-2xl border-zinc-200/50 shadow-2xl">
                {/* Editor Title Bar */}
                <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3">
                    {/* Window Controls */}
                    <div className="flex gap-1.5">
                        <div className="size-2.5 rounded-full bg-zinc-300"></div>
                        <div className="size-2.5 rounded-full bg-zinc-300"></div>
                        <div className="size-2.5 rounded-full bg-zinc-300"></div>
                    </div>

                    {/* Filename */}
                    <div className="font-mono text-[10px] text-zinc-400">
                        solution.py — CodeArena
                    </div>

                    {/* Settings Icon */}
                    <div className="flex gap-3">
                        <span className="material-symbols-outlined text-sm text-zinc-300">
                            settings
                        </span>
                    </div>
                </div>

                {/* Editor Content */}
                <div className="bg-bg-page p-8 font-mono text-[13px] leading-relaxed text-zinc-700">
                    {/* Line 1 */}
                    <div className="flex gap-4">
                        <span className="w-4 text-right text-zinc-300 select-none">1</span>
                        <span>
                            <span className="text-accent font-bold">def</span>{' '}
                            <span className="text-indigo-500">solve_challenge</span>(data):
                        </span>
                    </div>

                    {/* Line 2 */}
                    <div className="flex gap-4">
                        <span className="w-4 text-right text-zinc-300 select-none">2</span>
                        <span className="pl-4">
                            <span className="text-zinc-400"># Apply optimized binary search</span>
                        </span>
                    </div>

                    {/* Line 3 */}
                    <div className="flex gap-4">
                        <span className="w-4 text-right text-zinc-300 select-none">3</span>
                        <span className="pl-4">
                            left, right = <span className="text-emerald-600">0</span>,{' '}
                            <span className="text-emerald-600">len</span>(data)
                        </span>
                    </div>

                    {/* Line 4 */}
                    <div className="flex gap-4">
                        <span className="w-4 text-right text-zinc-300 select-none">4</span>
                        <span className="pl-4">
                            <span className="text-accent font-bold">while</span> left &lt; right:
                        </span>
                    </div>

                    {/* Line 5 */}
                    <div className="flex gap-4">
                        <span className="w-4 text-right text-zinc-300 select-none">5</span>
                        <span className="pl-8 text-zinc-400">...</span>
                    </div>

                    {/* Editor Footer / Status Bar */}
                    <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-6">
                        <div className="flex items-center gap-4">
                            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                PASS 24/24
                            </span>
                            <span className="text-[10px] text-zinc-400">1.2ms latency</span>
                        </div>
                        <button className="bg-accent/10 text-accent hover:bg-accent/20 cursor-pointer rounded px-3 py-1 text-[10px] font-bold transition-colors">
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

CodeEditorPreview.propTypes = {
    className: PropTypes.string,
}
