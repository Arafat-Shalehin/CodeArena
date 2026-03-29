'use client'

import React from 'react'

/**
 * Minimal hydration wrapper
 * Zustand's persist middleware handles hydration automatically
 * This wrapper just ensures it's mounted on client
 */
export function HydrationWrapper({ children }) {
    // Don't block rendering - Zustand auto-hydrates from localStorage
    return <>{children}</>
}
