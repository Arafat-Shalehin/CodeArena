import React from 'react'
import { cn } from '@/lib/utils'

/**
 * @component PatternButton
 * @description A high-impact CTA button with a radial grid background and border-image gradients.
 * Based on Uiverse snippet by Smit-Prajapati, mapped to Emerald Zenith tokens.
 */
export const PatternButton = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <button
            ref={ref}
            className={cn(
                'group relative cursor-pointer px-12 py-4 font-medium tracking-[0.5rem] uppercase transition-all duration-300 active:scale-95',
                className
            )}
            style={{
                /* Emerald Zenith Mapping */
                '--main-color': 'rgb(16, 185, 129)',
                '--main-bg-color': 'rgba(16, 185, 129, 0.36)',
                '--pattern-color': 'rgba(16, 185, 129, 0.073)',

                /* Gradients */
                background: `
          radial-gradient(circle, var(--main-bg-color) 0%, rgba(0, 0, 0, 0) 95%),
          linear-gradient(var(--pattern-color) 1px, transparent 1px),
          linear-gradient(to right, var(--pattern-color) 1px, transparent 1px)
        `,
                backgroundSize: 'cover, 15px 15px, 15px 15px',
                backgroundPosition: 'center center, center center, center center',

                /* Border Logic */
                borderImage: `radial-gradient(circle, var(--main-color) 0%, rgba(0, 0, 0, 0) 100%) 1`,
                borderWidth: '1px 0 1px 0',
                borderStyle: 'solid',

                color: 'var(--main-color)',
                fontSize: '1.1rem', // Slightly adjusted for Hero balance vs snippet's 1.5rem
            }}
            // Hover/Active states via Tailwind-like interaction logic
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundSize = 'cover, 10px 10px, 10px 10px'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundSize = 'cover, 15px 15px, 15px 15px'
            }}
            onMouseDown={(e) => {
                e.currentTarget.style.filter = 'hue-rotate(250deg)'
            }}
            onMouseUp={(e) => {
                e.currentTarget.style.filter = 'hue-rotate(0deg)'
            }}
            {...props}
        >
            <span className="relative z-10">{children}</span>
        </button>
    )
})

PatternButton.displayName = 'PatternButton'
