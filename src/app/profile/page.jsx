'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProfileSubmissions } from '@/features/profile/hooks/useProfileSubmissions'
import { useProfileCalendar } from '@/features/profile/hooks/useProfileCalendar'
import ProfileContent from '@/features/profile/components/ProfileContent'

export default function ProfilePage() {
    const router = useRouter()
    const { user, isLoading, updateProfile } = useAuth()

    const {
        submissions,
        hasMoreSubmissions,
        isSubmissionsLoading,
        fetchSubmissions,
        handleLoadMore,
        handleViewAll,
    } = useProfileSubmissions(user?._id || user?.id)

    const calendarData = useProfileCalendar(user?.stats?.activityCalendar)

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/login?error=unauthorized')
        }
    }, [user, isLoading, router])

    useEffect(() => {
        const userId = user?._id || user?.id
        if (!userId) return

        fetchSubmissions(5, 0, true)

        // Sync problem stats only — do NOT re-fetch the full user object, as
        // that would overwrite the correct following/followers arrays with
        // potentially stale auth-sync data.
        fetch('/api/user/sync', { method: 'POST' })
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.data) {
                    // Only patch the stats portion of the local user state
                    updateProfile?.({ stats: data.data })
                }
            })
            .catch(console.error)
    }, [user?._id, user?.id, fetchSubmissions, updateProfile])

    if (isLoading || (!user && !isLoading)) {
        return (
            <div className="bg-bg-page flex min-h-screen items-center justify-center">
                <Loader2 className="text-accent h-12 w-12 animate-spin" />
            </div>
        )
    }

    if (!user) return null

    return (
        <>
            <Navbar />
            <ProfileContent
                user={user}
                calendarData={calendarData}
                submissions={submissions}
                hasMoreSubmissions={hasMoreSubmissions}
                isSubmissionsLoading={isSubmissionsLoading}
                handleLoadMore={handleLoadMore}
                handleViewAll={handleViewAll}
                canViewFull={true}
                showRecommended={true}
            />
        </>
    )
}
