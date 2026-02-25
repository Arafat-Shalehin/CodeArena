'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

/**
 * ErrorBoundary Component
 *
 * A fallback component to catch JavaScript errors anywhere in the child component tree.
 * It logs errors and displays a fallback UI.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
        // Optional: window.location.reload() for a hard reset if needed
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border border-red-200 bg-red-50/50 p-6 text-center">
                    <div className="rounded-full bg-red-100 p-3">
                        <AlertTriangle className="size-8 text-red-600" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-red-900">Something went wrong</h2>
                        <p className="max-w-md text-sm text-red-600">
                            {this.state.error?.message ||
                                'An unexpected error occurred while rendering this component.'}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={this.handleReset}
                        className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-100 hover:text-red-900"
                    >
                        Try Again
                    </Button>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
