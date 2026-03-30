'use client'

import React from 'react'
import { usePageRestoration } from '@/hooks/usePageRestoration'

/**
 * Client-side wrapper that restores user to the page they were on before reload
 */
export function PageRestorationWrapper({ children }) {
    // Restore page on mount
    usePageRestoration()

    return <>{children}</>
}
