'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * @component Tiles
 * @description Renders an interactive grid of tiles that respond to hover.
 */
const tileSizes = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9 md:w-12 md:h-12',
    lg: 'w-12 h-12 md:w-16 md:h-16',
}

export function Tiles({ className, rows = 100, cols = 10, tileClassName, tileSize = 'md' }) {
    const rowsArray = new Array(rows).fill(1)
    const colsArray = new Array(cols).fill(1)

    return (
        <div className={cn('pointer-events-none absolute inset-0 z-0 overflow-hidden', className)}>
            {/* Radial Mask to fade edges */}
            <div
                className="absolute inset-0 z-10"
                style={{
                    maskImage: 'radial-gradient(circle at center, white 20%, transparent 80%)',
                    WebkitMaskImage:
                        'radial-gradient(circle at center, white 20%, transparent 80%)',
                }}
            >
                <motion.div
                    initial={{ x: -10, y: -10 }}
                    animate={{
                        x: [-10, 0, -10],
                        y: [-10, 0, -10],
                    }}
                    transition={{
                        duration: 30, // Slower, more atmospheric
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="flex h-[120%] w-[120%] justify-center"
                >
                    {rowsArray.map((_, i) => (
                        <div
                            key={`row-${i}`}
                            className={cn(
                                tileSizes[tileSize],
                                'border-border/20 dark:border-border/10 relative border-l',
                                tileClassName
                            )}
                        >
                            {colsArray.map((_, j) => (
                                <motion.div
                                    whileHover={{
                                        backgroundColor: `var(--tile)`,
                                        opacity: 0.2,
                                        transition: { duration: 0.2 },
                                    }}
                                    animate={{
                                        backgroundColor: [
                                            'transparent',
                                            Math.random() > 0.99 ? 'var(--tile)' : 'transparent',
                                            'transparent',
                                        ],
                                        opacity: [0, 0.15, 0],
                                        transition: {
                                            duration: Math.random() * 8 + 8,
                                            repeat: Infinity,
                                            delay: Math.random() * 10,
                                        },
                                    }}
                                    key={`col-${j}`}
                                    className={cn(
                                        tileSizes[tileSize],
                                        'border-border/20 dark:border-border/10 relative border-t border-r',
                                        tileClassName
                                    )}
                                />
                            ))}
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}
