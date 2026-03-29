'use client'

import React, { useEffect, useState } from 'react'
import { useProblemSolve } from '@/context/ProblemSolveContext'
import { Clock, CheckCircle2, XCircle, Info } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function SubmissionsTab() {
    const { problemId, viewSubmissionDetails, latestSubmissionEvent, language } = useProblemSolve()
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
        if (!latestSubmissionEvent || latestSubmissionEvent.problemId !== problemId) return

        const event = latestSubmissionEvent

        if (event.type === 'submission_queued') {
            setSubmissions((prev) => {
                if (prev.some((s) => s._id === event.submissionId)) return prev
                const newSub = {
                    _id: event.submissionId,
                    status: 'queued',
                    verdict: 'pending',
                    language: language || 'code',
                    createdAt: new Date().toISOString(),
                    executionTime: 0,
                    memoryUsed: 0,
                }
                return [newSub, ...prev]
            })
        } else if (event.type === 'submission_running') {
            setSubmissions((prev) =>
                prev.map((s) => (s._id === event.submissionId ? { ...s, status: 'running' } : s))
            )
        } else if (
            event.type === 'submission_evaluated' ||
            event.type === 'submit_result' ||
            event.type === 'run_result'
        ) {
            setSubmissions((prev) =>
                prev.map((s) =>
                    s._id === event.submissionId
                        ? {
                              ...s,
                              status: event.status || 'completed',
                              verdict: event.verdict,
                              executionTime: event.executionTime,
                              memoryUsed: event.memoryUsed,
                          }
                        : s
                )
            )
        }
    }, [latestSubmissionEvent, problemId, language])

    useEffect(() => {
        fetchSubmissions()
    }, [problemId])

    if (loading) {
        return (
            <div className="space-y-4 p-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-bg-muted h-20 w-full animate-pulse rounded-xl" />
                ))}
            </div>
        )
    }

    if (submissions.length === 0) {
        return (
            <div className="animate-fade-up flex h-full flex-col items-center justify-center p-8 text-center">
                <div className="bg-bg-muted mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner">
                    <Info size={32} className="text-text-muted opacity-40" />
                </div>
                <h3 className="text-text-primary text-xl font-bold tracking-tight">
                    No submissions yet
                </h3>
                <p className="text-text-muted mt-3 max-w-70 text-[13px] leading-relaxed font-medium">
                    Once you submit your code, your history and detailed results will appear here.
                </p>
            </div>
        )
    }

    return (
        <div className="animate-fade-up space-y-4 p-5">
            <h3 className="text-text-primary mb-2 px-1 text-sm font-bold tracking-wider uppercase">
                Recent History
            </h3>
            <div className="space-y-3">
                {submissions.map((sub) => (
                    <div
                        key={sub._id}
                        onClick={() => viewSubmissionDetails(sub._id)}
                        className="group border-border bg-bg-muted/50 hover:bg-bg-muted hover:border-accent/30 flex cursor-pointer items-center justify-between overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:shadow-lg"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-bg-page flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-inner">
                                {sub.status === 'queued' || sub.status === 'running' ? (
                                    <Clock className="text-warning animate-pulse" size={20} />
                                ) : (sub.verdict || '').toUpperCase() === 'ACCEPTED' ? (
                                    <CheckCircle2 className="text-success" size={20} />
                                ) : (
                                    <XCircle className="text-error" size={20} />
                                )}
                            </div>
                            <div>
                                <div
                                    className={`text-[15px] font-black tracking-tight capitalize ${
                                        sub.status === 'queued' || sub.status === 'running'
                                            ? 'text-warning'
                                            : (sub.verdict || '').toUpperCase() === 'ACCEPTED'
                                              ? 'text-success'
                                              : 'text-error'
                                    }`}
                                >
                                    {(sub.verdict || sub.status || 'pending').replace(/_/g, ' ')}
                                </div>
                                <div className="text-text-muted mt-0.5 flex items-center gap-2 text-[11px] font-bold uppercase">
                                    <span className="text-accent">{sub.language}</span>
                                    <span className="opacity-30">•</span>
                                    <span>
                                        {formatDistanceToNow(new Date(sub.createdAt), {
                                            addSuffix: true,
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-text-primary font-mono text-sm font-black">
                                {sub.executionTime}{' '}
                                <span className="text-text-muted text-[10px] font-medium">ms</span>
                            </div>
                            <div className="text-text-muted mt-1 font-mono text-[10px] font-bold">
                                {(sub.memoryUsed || 0).toFixed(1)}{' '}
                                <span className="font-sans uppercase">KB</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
