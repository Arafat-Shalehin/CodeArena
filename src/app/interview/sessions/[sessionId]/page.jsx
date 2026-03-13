'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import InterviewShell from '@/features/interview/InterviewShell'

export default function InterviewSessionPage() {
    const { sessionId } = useParams()
    const router = useRouter()

    const [sessionData, setSessionData] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!sessionId) {
            setError('No session ID provided.')
            setLoading(false)
            return
        }

        async function fetchSession() {
            try {
                const res = await fetch(`/api/interview/sessions/${sessionId}`, {
                    credentials: 'include',
                })

                if (!res.ok) {
                    const body = await res.json().catch(() => ({}))
                    setError(body.message || 'Failed to load interview session.')
                    return
                }

                const body = await res.json()
                setSessionData(body.data)
            } catch (err) {
                setError('Network error. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        fetchSession()
    }, [sessionId])

    const handleEnd = async () => {
        try {
            await fetch(`/api/interview/sessions/${sessionId}/end`, {
                method: 'POST',
                credentials: 'include',
            })
        } catch (_) {
            // best effort
        }
        router.replace('/interview/history')
    }

    if (loading) {
        return (
            <div className="bg-bg-page flex h-screen w-full flex-col items-center justify-center">
                <Loader2 size={32} className="text-accent mb-4 animate-spin" />
                <p className="text-text-secondary animate-pulse text-sm font-medium">
                    Restoring your session...
                </p>
            </div>
        )
    }

    if (error || !sessionData) {
        return (
            <div className="bg-bg-page flex h-screen w-full flex-col items-center justify-center gap-4">
                <span className="text-4xl">⚠️</span>
                <h2 className="text-text-primary text-xl font-bold">Unable to load session</h2>
                <p className="text-text-muted text-sm">{error || 'Session not found.'}</p>
                <button
                    onClick={() => router.push('/feed')}
                    className="rounded-md bg-[#2cbb5d] px-6 py-2 text-sm font-semibold text-white hover:bg-[#26a34f]"
                >
                    Go Home
                </button>
            </div>
        )
    }

    return (
        <InterviewShell
            sessionId={sessionData._id}
            problem={sessionData.problemIds?.[0]}
            wsToken={sessionData.wsToken}
            durationMins={sessionData.durationMins}
            startedAt={sessionData.startedAt}
            onEnd={handleEnd}
        />
    )
}
