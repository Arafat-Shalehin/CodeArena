'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * @component ThemeToggle
 * @description A modern, toggle-style theme switcher with smooth transitions.
 */
export function ThemeToggle({ className }) {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div
                suppressHydrationWarning
                className={cn(
                    'h-8 w-16 animate-pulse rounded-full border border-zinc-800 bg-zinc-800/20',
                    className
                )}
            />
        )
    }

    const isDark = resolvedTheme === 'dark'

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark')
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
