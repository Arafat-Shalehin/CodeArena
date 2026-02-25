/**
 * @file BreakdownChart.jsx
 * @description Visualization of problem-solving breakdown by difficulty.
 */

import React from 'react'

/**
 * @component ProgressItem
 * @description Helper component for a single difficulty progress bar.
 *
 * @param {Object} props - Component props
 * @param {string} props.label - Difficulty level (e.g., "Easy")
 * @param {number} props.count - Number of problems solved
 * @param {string} props.color - Tailwind background color class for the dot
 * @returns {JSX.Element}
 */
const ProgressItem = ({ label, count, color }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${color}`}></div>
            <span className="text-text-secondary text-sm">{label}</span>
        </div>
        <span className="text-text-primary text-sm font-bold">{count}</span>
    </div>
)

/**
 * @component BreakdownChart
 * @description Renders a pie chart and a list of difficulty breakdowns.
 *
 * @param {Object} props - Component props
 * @param {number} props.total - Total problems solved
 * @param {Array<{label: string, count: number, color: string}>} props.items - Array of difficulty stats
 * @returns {JSX.Element} The rendered BreakdownChart component.
 */
const BreakdownChart = ({ total, items }) => (
    <div className="bg-bg-subtle border-border h-full rounded-xl border p-6 shadow-sm">
        <h3 className="text-text-primary mb-6 text-lg font-bold">Problems Breakdown</h3>
        <div className="flex flex-col items-center justify-center gap-8">
            <div className="relative h-32 w-32">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                    <circle
                        className="stroke-success"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="16"
                        strokeDasharray="35, 100"
                        strokeDashoffset="0"
                        strokeWidth="4"
                    ></circle>
                    <circle
                        className="stroke-warning"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="16"
                        strokeDasharray="52, 100"
                        strokeDashoffset="-35"
                        strokeWidth="4"
                    ></circle>
                    <circle
                        className="stroke-error"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="16"
                        strokeDasharray="13, 100"
                        strokeDashoffset="-87"
                        strokeWidth="4"
                    ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-text-primary text-2xl font-bold">{total}</span>
                    <span className="text-text-muted text-[10px] font-bold uppercase">Total</span>
                </div>
            </div>
            <div className="w-full space-y-3">
                {items.map((item) => (
                    <ProgressItem
                        key={item.label}
                        label={item.label}
                        count={item.count}
                        color={item.color}
                    />
                ))}
            </div>
        </div>
    </div>
)

export default BreakdownChart
