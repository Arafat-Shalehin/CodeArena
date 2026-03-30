'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { usePathname } from 'next/navigation'

/**
 * @component SmoothScroll
 * @description Provides smooth inertial/momentum scrolling across the entire application.
 * Uses Lenis library for high-performance scroll management.
 */
export function SmoothScroll({ children }) {
    const pathname = usePathname()
    const lenisRef = useRef(null)
    const rafRef = useRef(null)
    const disableLenis = pathname?.startsWith('/feed')

    useEffect(() => {
        if (disableLenis) {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }
            if (lenisRef.current) {
                lenisRef.current.destroy()
                lenisRef.current = null
            }
            document.documentElement.classList.remove(
                'lenis',
                'lenis-smooth',
                'lenis-stopped',
                'lenis-scrolling'
            )
            return
        }

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
        lenisRef.current = lenis

        // Synchronize Lenis with RequestAnimationFrame
        function raf(time) {
            lenis.raf(time)
            rafRef.current = requestAnimationFrame(raf)
        }

        rafRef.current = requestAnimationFrame(raf)

        // Cleanup on unmount
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
            }
            lenis.destroy()
            lenisRef.current = null
        }
    }, [disableLenis])

    // Reset scroll position on route change
    useEffect(() => {
        if (disableLenis) {
            window.scrollTo(0, 0)
            return
        }

        if (lenisRef.current) {
            lenisRef.current.scrollTo(0, { immediate: true })
            return
        }

        window.scrollTo(0, 0)
    }, [pathname, disableLenis])

    return <>{children}</>
}
