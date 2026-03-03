/**
 * @file StatCard.jsx
 * @description A reusable card component for displaying key statistics with icons.
 */

import React from 'react'

/**
 * @component StatCard
 * @description Renders a statistics card with a title, value, subtext, and icon.
 *
 * @param {Object} props - Component props
 * @param {string} props.title - The title of the stat (e.g., "Problems Solved")
 * @param {string|number} props.value - The main statistic value
 * @param {string} props.sub - Subtext or trend indicator
 * @param {string} props.icon - Material Symbols icon name
 * @param {string} props.color - Tailwind text color class for the icon and subtext
 * @returns {JSX.Element} The rendered StatCard component.
 */
const StatCard = ({ title, value, sub, icon: Icon, color }) => (
    <div className="bg-bg-subtle border-border flex flex-col justify-between rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
            <p className="text-text-secondary text-sm font-medium">{title}</p>
            <Icon className={color} size={24} />
        </div>
        <div className="mt-4">
            <h3 className="text-text-primary text-3xl font-bold">{value}</h3>
            <p className={`${color} mt-1 text-xs font-bold`}>{sub}</p>
        </div>
    </div>
)

export default StatCard
