'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
    const { theme, setTheme, systemTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="relative h-9 w-9 rounded-full" /> // Placeholder to prevent layout shift
    }

    const currentTheme = theme === 'system' ? systemTheme : theme

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
            className="bg-bg-subtle hover:bg-bg-muted border-border relative h-9 w-9 rounded-full border transition-colors"
            aria-label="Toggle theme"
        >
            <motion.div
                initial={false}
                animate={{
                    scale: currentTheme === 'dark' ? 0 : 1,
                    opacity: currentTheme === 'dark' ? 0 : 1,
                    rotate: currentTheme === 'dark' ? -90 : 0,
                }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="absolute inset-0 flex items-center justify-center text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            >
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            </motion.div>
            <motion.div
                initial={false}
                animate={{
                    scale: currentTheme === 'dark' ? 1 : 0,
                    opacity: currentTheme === 'dark' ? 1 : 0,
                    rotate: currentTheme === 'dark' ? 0 : 90,
                }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="absolute inset-0 flex items-center justify-center text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]"
            >
                <Moon className="h-[1.2rem] w-[1.2rem]" />
            </motion.div>
        </Button>
    )
}
