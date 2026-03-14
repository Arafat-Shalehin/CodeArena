'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

/**
 * @component ThemeToggle
 * @description A premium theme switch with clouds, stars, and smooth transitions.
 * Uses the View Transition API for a circular reveal effect where supported.
 */
export function ThemeToggle() {
    const { theme, setTheme, systemTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="h-8 w-14" /> // Prevent layout shift
    }

    const currentTheme = theme === 'system' ? systemTheme : theme
    const isDark = currentTheme === 'dark'

    const handleToggle = (event) => {
        const nextTheme = isDark ? 'light' : 'dark'

        // Cinematic View Transition (Circular Reveal)
        if (!document.startViewTransition) {
            setTheme(nextTheme)
            return
        }

        // Get the click position or button center for the reveal
        const rect = event.currentTarget.getBoundingClientRect()
        const x = event.clientX ?? rect.left + rect.width / 2
        const y = event.clientY ?? rect.top + rect.height / 2

        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        )

        const transition = document.startViewTransition(() => {
            setTheme(nextTheme)
        })

        transition.ready.then(() => {
            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0 at ${x}px ${y}px)`,
                        `circle(${endRadius}px at ${x}px ${y}px)`,
                    ],
                },
                {
                    duration: 650,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    pseudoElement: '::view-transition-new(root)',
                }
            )
        })
    }

    return (
        <div className="flex items-center justify-center">
            <button
                onClick={handleToggle}
                className="theme-switch relative inline-block h-[2em] w-[3.5em] cursor-pointer border-none bg-transparent p-0 text-[17px] transition-transform outline-none active:scale-90"
                aria-label="Toggle Theme"
            >
                <input type="checkbox" checked={isDark} readOnly className="h-0 w-0 opacity-0" />
                <span className="slider absolute inset-0 rounded-[30px] transition-all duration-400" />
                <span className="clouds_stars absolute bottom-[50%] left-[70%] h-2.5 w-2.5 rounded-full transition-all duration-300" />
            </button>
        </div>
    )
}
