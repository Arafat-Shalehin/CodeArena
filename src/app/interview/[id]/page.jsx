'use client'

import React, { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import InterviewShell from '@/features/interview/InterviewShell'

export default function InterviewSessionPage({ params }) {
    const router = useRouter()
    const { id } = use(params)
    const [sessionData, setSessionData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return

        async function fetchSession() {
            try {
                const res = await fetch(`/api/interview/sessions/${id}`)
                if (!res.ok) {
                    throw new Error('Failed to load session')
                }
                const json = await res.json()
                setSessionData(json.data)
            } catch (err) {
                console.error(err)
                toast.error('Could not load interview session')
                router.push('/interview')
            } finally {
                setLoading(false)
            }
        }

        fetchSession()
    }, [id, router])

    const handleEnd = async () => {
        try {
            const res = await fetch(`/api/interview/sessions/${id}/end`, {
                method: 'POST',
            })
            if (res.ok) {
                toast.success('Interview session ended')
                router.push(`/interview/${id}/result`)
            } else {
                const data = await res.json()
                throw new Error(data.message || 'Failed to end session')
            }
        } catch (error) {
            console.error('Failed to end session:', error)
            toast.error(error.message)
            router.push('/interview')
        }
    }

    if (loading) {
        return (
            <div className="bg-bg-page flex h-screen w-full items-center justify-center">
                <Loader2 size={32} className="text-accent animate-spin" />
            </div>
        )
    }

    return (
        <main className="bg-bg-page min-h-screen overflow-hidden">
            <InterviewShell
                sessionId={id}
                onEnd={handleEnd}
                problem={sessionData?.problemIds?.[0]}
                durationMins={sessionData?.durationMins}
                startedAt={sessionData?.startedAt}
                initialMessages={sessionData?.messages || []}
                // Note: wsToken will still be fetched by rehydrate internally or we could pass it if fetched here
            />
        </main>
    )
}
