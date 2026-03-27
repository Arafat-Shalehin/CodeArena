'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

/**
 * PanelErrorBoundary Component
 *
 * A lightweight error boundary for individual panels (Description, Editor, Console).
 * Provides a compact error UI with retry functionality.
 *
 * Features:
 * - Compact error display suitable for panels
 * - Retry button to re-render children
 * - Error logging with component name
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @param {string} props.panelName - Name of the panel for error logging
 * @param {string} [props.className] - Additional CSS classes
 */
export default function PanelErrorBoundary({ children, panelName = 'Panel', className = '' }) {
    const [hasError, setHasError] = useState(false)
    const [error, setError] = useState(null)
    const [retryKey, setRetryKey] = useState(0)

    // Reset error state when children change
    useEffect(() => {
        setHasError(false)
        setError(null)
    }, [children])

    // Custom error handler
    const handleError = (error) => {
        console.error(`[${panelName}] Error:`, error)
        setHasError(true)
        setError(error)
    }

    // Retry render
    const handleRetry = () => {
        setRetryKey((prev) => prev + 1)
        setHasError(false)
        setError(null)
    }

    if (hasError) {
        return (
            <div
                className={`bg-bg-page flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center ${className}`}
            >
                <div className="bg-error/10 rounded-full p-2">
                    <AlertCircle className="text-error h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-text-primary text-sm font-semibold">
                        {panelName} Failed to Load
                    </h3>
                    <p className="text-text-muted text-xs">
                        {error?.message || 'An unexpected error occurred'}
                    </p>
                </div>
                <Button onClick={handleRetry} variant="outline" size="sm" className="h-8 gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry
                </Button>
            </div>
        )
    }

    return (
        <React.Fragment key={retryKey}>
            <ErrorCatcher onError={handleError}>{children}</ErrorCatcher>
        </React.Fragment>
    )
}

/**
 * ErrorCatcher Component
 *
 * A simple error catcher using error boundaries internally.
 * Used by PanelErrorBoundary to catch errors in children.
 */
class ErrorCatcher extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error) {
        this.props.onError?.(error)
    }

    render() {
        if (this.state.hasError) {
            return null
        }
        return this.props.children
    }
}
