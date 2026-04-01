'use client'

import Navbar from '@/components/layout/Navbar'
import DashboardHome from '@/features/home/components/DashboardHome'
import { Loader2 } from 'lucide-react'

import ErrorBoundary from '@/components/ui/error-boundary'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Feed Page
 *
 * Dedicated route for the authenticated user social feed and dashboard.
 * Protected route: redirects to /login if unauthenticated.
 */
export default function FeedPage() {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login?error=unauthorized')
        }
    }, [isLoading, isAuthenticated, router])

    return (
        <div className="text-text-primary bg-bg-page site-gradient flex min-h-screen flex-col font-sans">
            <Navbar />

            <main className="flex-grow">
                {isLoading || !isAuthenticated ? (
                    <div className="flex min-h-[50vh] items-center justify-center">
                        <Loader2 className="text-accent h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <ErrorBoundary>
                        <DashboardHome user={user} />
                    </ErrorBoundary>
                )}
            </main>
        </div>
    )
}
