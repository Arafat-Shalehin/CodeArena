'use client'

import dynamic from 'next/dynamic'

// Dynamically import SmoothScroll with ssr:false so Lenis is never bundled
// into the initial page JS. It loads after hydration — keeping the critical
// path free of the RAF loop and lenis parse/execute cost.
const SmoothScrollInner = dynamic(
    () => import('./SmoothScroll').then((m) => ({ default: m.SmoothScroll })),
    { ssr: false }
)

/**
 * @component SmoothScrollProvider
 * @description Thin client wrapper that defers Lenis initialization via
 * next/dynamic (ssr: false). Must be a Client Component to use dynamic with
 * ssr:false — Server Components ignore that option.
 */
export function SmoothScrollProvider({ children }) {
    return <SmoothScrollInner>{children}</SmoothScrollInner>
}
