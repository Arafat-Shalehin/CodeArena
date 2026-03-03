/**
 * @file Heatmap.jsx
 * @description A contribution heatmap component reflecting coding activity.
 */

import React from 'react'
import { Calendar } from 'lucide-react'
import { MONTHS } from '../data/dashboard.data'

/**
 * @component Heatmap
 * @description Renders a grid of activity squares representing code contributions over time.
 *
 * @param {Object} props - Component props
 * @param {string[]} props.data - Array of intensity color classes for each cell
 * @returns {JSX.Element} The rendered Heatmap component.
 */
const Heatmap = ({ data }) => (
    <div className="bg-bg-subtle border-border rounded-xl border p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
            <h3 className="text-text-primary flex items-center gap-2 text-lg font-bold">
                <Calendar className="text-accent size-5" />
                Submission Activity
            </h3>
            <div className="text-text-muted flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="bg-bg-muted h-3 w-3 rounded-sm"></div>
                    <div className="bg-accent/20 h-3 w-3 rounded-sm"></div>
                    <div className="bg-accent/40 h-3 w-3 rounded-sm"></div>
                    <div className="bg-accent/70 h-3 w-3 rounded-sm"></div>
                    <div className="bg-accent h-3 w-3 rounded-sm"></div>
                </div>
                <span>More</span>
            </div>
        </div>
        <div className="no-scrollbar overflow-x-auto pb-2">
            <div className="min-w-[650px]">
                <div className="grid w-full grid-cols-[repeat(52,1fr)] gap-[2px]">
                    {data.map((intensity, idx) => (
                        <div key={idx} className={`aspect-square rounded-[2px] ${intensity}`}></div>
                    ))}
                </div>
                <div className="text-text-muted mt-4 flex justify-between text-[10px] font-medium">
                    {MONTHS.map((m) => (
                        <span key={m}>{m}</span>
                    ))}
                </div>
            </div>
        </div>
    </div>
)

export default Heatmap
