'use client'

import React, { useEffect, useState } from 'react'
import { useProblemSolve } from '@/context/ProblemSolveContext'
import { Clock, CheckCircle2, XCircle, Info } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function SubmissionsTab() {
    const { problemId, viewSubmissionDetails } = useProblemSolve()
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
                    <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-[#333]" />
                ))}
            </div>
        )
    }

    if (submissions.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <Info size={40} className="mb-4 text-gray-600" />
                <h3 className="text-lg font-semibold text-white">No submissions yet</h3>
                <p className="mt-2 max-w-[250px] text-sm text-gray-500">
                    Submit your code to see your history and test results here.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-3 p-4">
            <h3 className="mb-4 px-2 text-sm font-bold text-white">Recent Submissions</h3>
            {submissions.map((sub) => (
                <div
                    key={sub._id}
                    onClick={() => viewSubmissionDetails(sub._id)}
                    className="group flex cursor-pointer items-center justify-between rounded-lg border border-[#333] bg-[#262626] p-3 transition-colors hover:border-[#444]"
                >
                    <div className="flex items-center gap-3">
                        {sub.status === 'queued' || sub.status === 'running' ? (
                            <Clock className="animate-pulse text-[#ffc01e]" size={20} />
                        ) : sub.verdict === 'accepted' ? (
                            <CheckCircle2 className="text-[#2cbb5d]" size={20} />
                        ) : (
                            <XCircle className="text-[#ff375f]" size={20} />
                        )}
                        <div>
                            <div
                                className={`text-sm font-bold capitalize ${
                                    sub.status === 'queued' || sub.status === 'running'
                                        ? 'text-[#ffc01e]'
                                        : sub.verdict === 'accepted'
                                          ? 'text-[#2cbb5d]'
                                          : 'text-[#ff375f]'
                                }`}
                            >
                                {(sub.verdict || sub.status || 'pending').replace(/_/g, ' ')}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-gray-500">
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
                        <div className="font-mono text-xs font-medium text-white">
                            {sub.executionTime} ms
                        </div>
                        <div className="text-[10px] text-gray-500">
                            {(sub.memoryUsed || 0).toFixed(1)} KB
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
