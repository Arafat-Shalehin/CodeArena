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
        <div className={cn('relative z-0 flex h-full w-full justify-center', className)}>
            {rowsArray.map((_, i) => (
                <motion.div
                    key={`row-${i}`}
                    className={cn(
                        tileSizes[tileSize],
                        'relative border-l border-neutral-300 dark:border-neutral-800/50',
                        tileClassName
                    )}
                >
                    {colsArray.map((_, j) => (
                        <motion.div
                            whileHover={{
                                backgroundColor: `var(--ca-accent)`, // Using site's accent token
                                transition: { duration: 0 },
                            }}
                            animate={{
                                transition: { duration: 2 },
                            }}
                            key={`col-${j}`}
                            className={cn(
                                tileSizes[tileSize],
                                'relative border-t border-r border-neutral-300 dark:border-neutral-800/50',
                                tileClassName
                            )}
                        />
                    ))}
                </motion.div>
            ))}
        </div>
    )
}
