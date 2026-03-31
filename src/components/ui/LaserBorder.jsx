'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'

export function LaserBorder({
    className,
    color = 'var(--color-accent)',
    duration = 2,
    strokeWidth = 2,
    isHovered = false,
}) {
    const [rect, setRect] = useState({ width: 0, height: 0 })
    const ref = useRef(null)

    React.useEffect(() => {
        if (ref.current) {
            const { width, height } = ref.current.getBoundingClientRect()
            setRect({ width, height })
        }
    }, [])

    // Path for a rectangle
    const path = `M 0 0 H ${rect.width} V ${rect.height} H 0 L 0 0`

    return (
        <div
            ref={ref}
            className={`pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-[inherit] ${className}`}
        >
            <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${rect.width} ${rect.height}`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0"
                aria-hidden="true"
            >
                <motion.path
                    d={path}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={
                        isHovered
                            ? {
                                  pathLength: [0, 1],
                                  opacity: [0, 1, 1, 0],
                                  pathOffset: [0, 1],
                              }
                            : { opacity: 0 }
                    }
                    transition={{
                        duration: duration,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />

                {/* Glow point (Trailing the laser) */}
                <motion.circle
                    r="3"
                    fill={color}
                    initial={{ opacity: 0 }}
                    animate={
                        isHovered
                            ? {
                                  opacity: [0, 1, 1, 0],
                              }
                            : { opacity: 0 }
                    }
                    transition={{ duration: 0.2 }}
                    style={{
                        offsetPath: `path("${path}")`,
                        offsetRotate: 'auto',
                    }}
                >
                    <animateMotion dur={`${duration}s`} repeatCount="indefinite" path={path} />
                </motion.circle>
            </svg>
        </div>
    )
}
