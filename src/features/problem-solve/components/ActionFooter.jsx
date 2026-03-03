'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp } from 'lucide-react'

import { useProblemSolve } from '@/context/ProblemSolveContext'
import { toast } from 'sonner' // Assuming sonner is used for notifications based on project feel

export default function ActionFooter() {
    const {
        code,
        language,
        problemId,
        isSubmitting,
        setIsSubmitting,
        setSubmissionResult,
        setTestCaseResults,
        isConsoleOpen,
        setIsConsoleOpen,
    } = useProblemSolve()

    const handleSubmit = async () => {
        if (isSubmitting) return

        setIsSubmitting(true)
        setSubmissionResult(null)
        setTestCaseResults([])

        try {
            const res = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problemId,
                    code,
                    language,
                }),
            })

            const responseData = await res.json()

            if (!responseData.success) {
                toast.error(responseData.message || 'Submission failed')
                setIsSubmitting(false)
                return
            }

            const submissionId = responseData.data._id

            // Poll for results
            pollResult(submissionId)
        } catch (error) {
            toast.error('An error occurred during submission')
            setIsSubmitting(false)
        }
    }

    const pollResult = async (id) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/submissions/${id}`)
                const data = await res.json()

                if (data.success && data.data.status === 'completed') {
                    clearInterval(interval)
                    setSubmissionResult(data.data)
                    setTestCaseResults(data.data.testCaseResults || [])
                    setIsSubmitting(false)

                    if (data.data.verdict === 'accepted') {
                        toast.success('Accepted!')
                    } else {
                        toast.error(data.data.verdict.replace('_', ' ').toUpperCase())
                    }
                } else if (data.success && data.data.status === 'error') {
                    clearInterval(interval)
                    setSubmissionResult(data.data)
                    setIsSubmitting(false)
                    // Show a more descriptive error if available
                    const errorMessage = data.data.error || 'System Error'
                    toast.error(errorMessage)
                }
            } catch (err) {
                console.error('Polling error:', err)
            }
        }, 2000)
    }

    return (
        <div className="border-border bg-bg-subtle flex h-14 shrink-0 items-center justify-between border-t px-6">
            {/* Console Toggler */}
            <button
                onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                className="text-text-muted hover:text-text-primary flex items-center gap-2 text-sm font-medium transition-colors"
            >
                <ChevronUp
                    className={`transition-transform duration-200 ${isConsoleOpen ? 'rotate-180' : ''}`}
                    size={20}
                />
                Console
            </button>

            {/* Form Actions */}
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    className="h-9 px-5 text-sm font-semibold"
                    disabled={isSubmitting}
                >
                    Run Code
                </Button>
                <Button
                    variant="default"
                    className="shadow-accent-glow h-9 px-6 text-sm font-bold"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
            </div>
        </div>
    )
}
