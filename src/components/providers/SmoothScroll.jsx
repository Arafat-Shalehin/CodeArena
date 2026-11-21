'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { usePathname } from 'next/navigation'

/**
 * @component SmoothScroll
 * @description Provides smooth inertial/momentum scrolling across the entire application.
 * Uses Lenis library for high-performance scroll management.
 */
export function SmoothScroll({ children }) {
    const pathname = usePathname()

    useEffect(() => {
        // Initialize Lenis
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
            autoResize: true,
        })

        // Synchronize Lenis with RequestAnimationFrame
        let rafId
        function raf(time) {
            lenis.raf(time)
            rafId = requestAnimationFrame(raf)
        }
        rafId = requestAnimationFrame(raf)

        // Cancel the loop AND destroy lenis on unmount to prevent memory leaks
        return () => {
            cancelAnimationFrame(rafId)
            lenis.destroy()
        }
    }, [])

    // Reset scroll position on route change
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return <>{children}</>
}
