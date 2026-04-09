'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/layout/Navbar'
import { Loader2 } from 'lucide-react'
import { useProfileSubmissions } from '@/features/profile/hooks/useProfileSubmissions'
import { useProfileCalendar } from '@/features/profile/hooks/useProfileCalendar'
import ProfileContent from '@/features/profile/components/ProfileContent'

export default function PublicProfilePage({ params }) {
    const { id } = use(params)
    const router = useRouter()
    const { user: currentUser, isLoading: authLoading } = useAuth()

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [privacy, setPrivacy] = useState(null)

    const {
        submissions,
        hasMoreSubmissions,
        isSubmissionsLoading,
        fetchSubmissions,
        handleLoadMore,
        handleViewAll,
    } = useProfileSubmissions(id)

    const calendarData = useProfileCalendar(user?.stats?.activityCalendar)

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch(`/api/users/${id}`)
            const data = await res.json()
            if (data.success && data.data) {
                const dbUser = data.data
                setUser({
                    ...dbUser,
                    avatarSeed: dbUser.avatarSeed || dbUser.name,
                })
                setPrivacy(dbUser.privacySettings || {})
                fetchSubmissions(5, 0, true)
            } else {
                setError('User Not Found')
            }
        } catch (err) {
            console.error('Failed to fetch user:', err)
            setError('User Not Found')
        } finally {
            setLoading(false)
        }
    }, [id, fetchSubmissions])

    useEffect(() => {
        if (!authLoading && currentUser && (currentUser._id === id || currentUser.id === id)) {
            router.replace('/profile')
            return
        }

        if (!authLoading) {
            fetchUser()
            // Only sync stats in the background — do NOT re-fetch the full user
            // profile after sync, as that would hit Redis cache and overwrite
            // correct following/followers counts with stale data.
            fetch('/api/user/sync', { method: 'POST' }).catch(console.error)
        }
    }, [id, currentUser, authLoading, router, fetchUser])

    if (loading || authLoading) {
        return (
            <div className="bg-bg-page flex min-h-screen items-center justify-center">
                <Loader2 className="text-accent h-12 w-12 animate-spin" />
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="bg-bg-page flex min-h-screen flex-col items-center justify-center space-y-4">
                <div className="text-4xl">👤</div>
                <h2 className="text-text-primary text-xl font-bold">{error || 'User not found'}</h2>
                <button onClick={() => router.push('/leaderboard')} className="btn-primary">
                    Back to Leaderboard
                </button>
            </div>
        )
    }

    const visibility = privacy?.profileVisibility || 'public'
    const isFollowing = currentUser?.following?.includes(id)
    const canViewFull = visibility === 'public' || (visibility === 'followers' && isFollowing)

    return (
        <>
            <Navbar />
            <ProfileContent
                user={user}
                privacy={privacy}
                canViewFull={canViewFull}
                calendarData={calendarData}
                submissions={submissions}
                hasMoreSubmissions={hasMoreSubmissions}
                isSubmissionsLoading={isSubmissionsLoading}
                handleLoadMore={handleLoadMore}
                handleViewAll={handleViewAll}
                showRecommended={false}
            />
        </>
    )
}
