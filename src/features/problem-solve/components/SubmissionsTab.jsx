'use client'

import React, { useEffect, useState } from 'react'
import { useProblemSolve } from '@/context/ProblemSolveContext'
import { Clock, CheckCircle2, XCircle, Info } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function SubmissionsTab() {
    const { problemId } = useProblemSolve()
    const [submissions, setSubmissions] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchSubmissions = async () => {
        try {
            const res = await fetch(`/api/problems/${problemId}/my-submissions`)
            const data = await res.json()
            if (data.success) {
                setSubmissions(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch submissions:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSubmissions()
    }, [problemId])

    if (loading) {
        return (
            <div className="space-y-4 p-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-bg-muted h-16 w-full animate-pulse rounded-lg" />
                ))}
            </div>
        )
    }

    if (submissions.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <Info size={40} className="text-text-muted mb-4" />
                <h3 className="text-text-primary text-lg font-semibold">No submissions yet</h3>
                <p className="text-text-muted mt-2 max-w-[250px] text-sm">
                    Submit your code to see your history and test results here.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-3 p-4">
            <h3 className="text-text-primary mb-4 px-2 text-sm font-bold">Recent Submissions</h3>
            {submissions.map((sub) => (
                <div
                    key={sub._id}
                    className="bg-bg-subtle border-border hover:border-accent/40 group flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        {sub.verdict === 'accepted' ? (
                            <CheckCircle2 className="text-success" size={20} />
                        ) : (
                            <XCircle className="text-error" size={20} />
                        )}
                        <div>
                            <div
                                className={`text-sm font-bold capitalize ${sub.verdict === 'accepted' ? 'text-success' : 'text-error'}`}
                            >
                                {sub.verdict.replace('_', ' ')}
                            </div>
                            <div className="text-text-muted flex items-center gap-2 text-[11px]">
                                <span className="uppercase">{sub.language}</span>
                                <span>•</span>
                                <span>
                                    {formatDistanceToNow(new Date(sub.createdAt), {
                                        addSuffix: true,
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-text-primary font-mono text-xs font-medium">
                            {sub.executionTime} ms
                        </div>
                        <div className="text-text-muted text-[10px]">
                            {(sub.memoryUsed || 0).toFixed(1)} KB
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
