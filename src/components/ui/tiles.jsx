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
        <motion.div
            initial={{ x: -20, y: -20 }}
            animate={{
                x: [-20, 0, -20],
                y: [-20, 0, -20],
            }}
            transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
            }}
            className={cn(
                'relative z-0 flex h-[110%] w-[110%] justify-center overflow-hidden',
                className
            )}
        >
            {rowsArray.map((_, i) => (
                <motion.div
                    key={`row-${i}`}
                    className={cn(
                        tileSizes[tileSize],
                        'relative border-l border-neutral-200 dark:border-neutral-900',
                        tileClassName
                    )}
                >
                    {colsArray.map((_, j) => (
                        <motion.div
                            whileHover={{
                                backgroundColor: `var(--tile)`,
                                transition: { duration: 0 },
                            }}
                            animate={{
                                backgroundColor: [
                                    'transparent',
                                    Math.random() > 0.98 ? 'var(--tile)' : 'transparent',
                                    'transparent',
                                ],
                                transition: {
                                    duration: Math.random() * 5 + 5,
                                    repeat: Infinity,
                                    delay: Math.random() * 10,
                                },
                            }}
                            key={`col-${j}`}
                            className={cn(
                                tileSizes[tileSize],
                                'relative border-t border-r border-neutral-200 dark:border-neutral-900',
                                tileClassName
                            )}
                        />
                    ))}
                </motion.div>
            ))}
        </motion.div>
    )
}
