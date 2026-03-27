'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * Hydration-safe reduced motion flag.
 * Returns `false` until mounted so SSR and first client render match.
 */
export function useSafeReducedMotion() {
    const prefersReducedMotion = useReducedMotion()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return mounted && !!prefersReducedMotion
}
