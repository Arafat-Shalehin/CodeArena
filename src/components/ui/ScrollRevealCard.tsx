'use client'
import React, { useRef, ReactNode } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ScrollRevealCardProps {
    title?: ReactNode
    children: ReactNode
    className?: string
}

export const ScrollRevealCard = ({ title, children, className }: ScrollRevealCardProps) => {
    const containerRef = useRef<HTMLDivElement>(null)

    // Track scroll progress of the container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start'],
    })

    // Mapping scroll progress [0, 1] to the desired 3D transforms
    // We reach the "straight" state (0deg, scale 1) around 40% of the scroll for better feel
    const rotateX = useTransform(scrollYProgress, [0, 0.4], [20, 0])
    const scale = useTransform(scrollYProgress, [0, 0.4], [1.05, 1])
    const translateY = useTransform(scrollYProgress, [0, 0.4], [0, -100])

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative flex flex-col items-center justify-center p-4 md:p-20',
                className
            )}
            style={{
                perspective: '1000px',
            }}
        >
            {title && (
                <motion.div style={{ translateY }} className="mb-10 w-full max-w-5xl text-center">
                    {title}
                </motion.div>
            )}

            <motion.div
                style={{
                    rotateX,
                    scale,
                    translateY,
                    boxShadow:
                        '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026',
                }}
                className="relative w-full max-w-6xl rounded-[30px] border border-white/10 bg-[#121212] p-2 shadow-2xl md:p-4"
            >
                <div className="h-full w-full overflow-hidden rounded-2xl border border-white/5 bg-zinc-900">
                    {children}
                </div>
            </motion.div>
        </div>
    )
}
