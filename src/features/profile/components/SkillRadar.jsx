'use client'

import React from 'react'

/**
 * @component SkillRadar
 * @description A lightweight, dependency-free SVG radar chart to visualize
 * user proficiency across different algorithmic categories.
 */
export default function SkillRadar({ stats }) {
    // Labels for the radar chart
    const categories = [
        { name: 'Algorithms', key: 'algorithms' },
        { name: 'Data Structures', key: 'dataStructures' },
        { name: 'Math', key: 'math' },
        { name: 'Strings', key: 'strings' },
        { name: 'Greedy', key: 'greedy' },
        { name: 'Graphs', key: 'graphs' },
    ]

    // Map stats to data points (0-100 scale)
    const dataPoints = categories.map((cat) => {
        const value = stats?.[cat.key] || 10 // Default minimal value for new profiles
        return Math.min(100, Math.max(10, value))
    })

    const size = 300
    const center = size / 2
    const radius = center * 0.7
    const angleStep = (Math.PI * 2) / categories.length

    // Calculate points for the polygon
    const points = dataPoints
        .map((val, i) => {
            const angle = i * angleStep - Math.PI / 2
            const r = (val / 100) * radius
            const x = center + r * Math.cos(angle)
            const y = center + r * Math.sin(angle)
            return `${x},${y}`
        })
        .join(' ')

    // Calculate grid circles
    const gridLevels = [0.25, 0.5, 0.75, 1]

    return (
        <section className="bg-bg-subtle border-border rounded-2xl border p-6 shadow-sm">
            <h3 className="text-text-primary mb-6 text-lg font-bold">Skill Proficiency</h3>

            <div className="relative flex aspect-square items-center justify-center">
                <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${size} ${size}`}
                    className="max-w-[280px]"
                >
                    {/* Grid Circles */}
                    {gridLevels.map((lvl, i) => (
                        <circle
                            key={i}
                            cx={center}
                            cy={center}
                            r={radius * lvl}
                            fill="none"
                            stroke="var(--color-bg-muted)"
                            strokeWidth="1"
                            strokeDasharray={i === 3 ? '0' : '4 4'}
                        />
                    ))}

                    {/* Axis Lines */}
                    {categories.map((_, i) => {
                        const angle = i * angleStep - Math.PI / 2
                        const x = center + radius * Math.cos(angle)
                        const y = center + radius * Math.sin(angle)
                        return (
                            <line
                                key={i}
                                x1={center}
                                y1={center}
                                x2={x}
                                y2={y}
                                stroke="var(--color-bg-muted)"
                                strokeWidth="1"
                            />
                        )
                    })}

                    {/* Proficiency Polygon */}
                    <polygon
                        points={points}
                        fill="var(--color-accent)"
                        fillOpacity="0.15"
                        stroke="var(--color-accent)"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        className="transition-all duration-1000 ease-in-out"
                    />

                    {/* Category Labels */}
                    {categories.map((cat, i) => {
                        const angle = i * angleStep - Math.PI / 2
                        const labelR = radius + 25
                        const x = center + labelR * Math.cos(angle)
                        const y = center + labelR * Math.sin(angle)

                        return (
                            <text
                                key={cat.name}
                                x={x}
                                y={y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-text-muted text-[10px] font-bold tracking-tighter uppercase"
                            >
                                {cat.name}
                            </text>
                        )
                    })}
                </svg>
            </div>
        </section>
    )
}
