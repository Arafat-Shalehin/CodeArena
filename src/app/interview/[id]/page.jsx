'use client'

import React, { use } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import InterviewShell from '@/features/interview/InterviewShell'

export default function InterviewSessionPage({ params }) {
    const router = useRouter()
    const { id } = use(params)

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

    return (
        <main className="bg-bg-page min-h-screen overflow-hidden">
            <InterviewShell sessionId={id} onEnd={handleEnd} />
        </main>
    )
}
