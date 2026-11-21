'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * @component ThemeToggle
 * @description A modern, toggle-style theme switcher with smooth transitions.
 * Includes a hydration fix to ensure server and client match perfectly.
 */
export function ThemeToggle({ className }) {
    const [mounted, setMounted] = useState(false)
    const { setTheme, resolvedTheme } = useTheme()

    // When mounted on client, now we can show the UI
    useEffect(() => {
        setMounted(true)
    }, [])

    const isDark = resolvedTheme === 'dark'

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark')
    }

    // Prevent hydration mismatch: do not render anything until client-side mounted
    if (!mounted) {
        return (
            <div
                className={cn(
                    'group relative flex h-8 w-16 cursor-pointer rounded-full p-1 opacity-0 transition-all duration-300',
                    className
                )}
            />
        )
    }

    return (
        <div
            suppressHydrationWarning
            className={cn(
                'group relative flex h-8 w-16 cursor-pointer rounded-full p-1 transition-all duration-300',
                isDark
                    ? 'border border-zinc-800 bg-zinc-950'
                    : 'border border-zinc-200 bg-white shadow-sm',
                className
            )}
            onClick={toggleTheme}
            role="button"
            aria-label="Toggle Theme"
            tabIndex={0}
        >
            <div className="relative flex h-full w-full items-center justify-between">
                {/* Sliding Indicator Background */}
                <div
                    className={cn(
                        'absolute flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-all duration-300 ease-in-out',
                        isDark ? 'left-0 bg-zinc-800' : 'left-8 bg-gray-100'
                    )}
                >
                    {isDark ? (
                        <Moon
                            className="h-3.5 w-3.5 text-indigo-300 transition-transform duration-300 group-hover:scale-110"
                            strokeWidth={2}
                        />
                    ) : (
                        <Sun
                            className="h-3.5 w-3.5 text-amber-500 transition-transform duration-300 group-hover:rotate-45"
                            strokeWidth={2}
                        />
                    )}
                </div>

                {/* Static Background Icons */}
                <div className="z-0 flex h-6 w-6 items-center justify-center">
                    {!isDark && (
                        <Moon className="h-3.5 w-3.5 text-zinc-400 opacity-40" strokeWidth={1.5} />
                    )}
                </div>
                <div className="z-0 flex h-6 w-6 items-center justify-center">
                    {isDark && (
                        <Sun className="h-3.5 w-3.5 text-zinc-600 opacity-40" strokeWidth={1.5} />
                    )}
                </div>
            </div>
        </div>
    )
}
