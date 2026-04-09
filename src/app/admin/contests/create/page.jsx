'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Save, Loader2, CheckCircle2 } from 'lucide-react'
import Swal from 'sweetalert2'

export default function CreateContestPage() {
    const router = useRouter()
    const [availableProblems, setAvailableProblems] = useState([])
    const [isLoadingProblems, setIsLoadingProblems] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        problemIds: [],
    })

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const res = await fetch('/api/problems')
                const data = await res.json()
                if (data.success) {
                    setAvailableProblems(data.data)
                }
            } catch (error) {
                console.error('Failed to fetch problems:', error)
            } finally {
                setIsLoadingProblems(false)
            }
        }
        fetchProblems()
    }, [])

    const handleProblemSelect = (problemId) => {
        setFormData((prev) => {
            const isSelected = prev.problemIds.includes(problemId)
            const updatedIds = isSelected
                ? prev.problemIds.filter((id) => id !== problemId)
                : [...prev.problemIds, problemId]

            return { ...prev, problemIds: updatedIds }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.problemIds.length === 0) {
            return Swal.fire({
                title: 'SELECTION REQUIRED',
                text: 'Please select at least one problem for the contest.',
                icon: 'warning',
                background: 'var(--ca-bg-page)',
                color: 'var(--ca-text-primary)',
            })
        }
        if (new Date(formData.endTime) <= new Date(formData.startTime)) {
            return Swal.fire({
                title: 'TIMELINE ERROR',
                text: 'End time must be after start time.',
                icon: 'warning',
                background: 'var(--ca-bg-page)',
                color: 'var(--ca-text-primary)',
            })
        }
        setIsSubmitting(true)
        try {
            const res = await fetch('/api/contests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (data.success) {
                Swal.fire({
                    title: 'MISSION SUCCESS',
                    text: 'Contest has been successfully deployed.',
                    icon: 'success',
                    background: 'var(--ca-bg-page)',
                    color: 'var(--ca-text-primary)',
                    confirmButtonColor: 'var(--ca-accent)',
                }).then(() => {
                    router.push('/admin/contests')
                })
            } else {
                Swal.fire({
                    title: 'DEPLOYMENT FAILED',
                    text: data.message || 'Error occurred during creation',
                    icon: 'error',
                    background: 'var(--ca-bg-page)',
                    color: 'var(--ca-text-primary)',
                })
            }
        } catch (error) {
            Swal.fire({
                title: 'SERVER ERROR',
                text: 'Terminal connection lost.',
                icon: 'error',
                background: 'var(--ca-bg-page)',
                color: 'var(--ca-text-primary)',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="mx-auto max-w-4xl space-y-10 py-6">
            <header className="flex flex-col gap-1">
                <h1 className="text-text-primary text-3xl font-black tracking-tight uppercase italic">
                    Deploy <span className="text-accent">New Contest</span>
                </h1>
                <p className="text-text-muted text-[10px] font-black tracking-widest uppercase opacity-70">
                    Host a competitive sprint event
                </p>
            </header>

            <form
                onSubmit={handleSubmit}
                className="matte-surface border-border bg-bg-subtle/40 space-y-8 rounded-3xl border p-10 shadow-2xl"
            >
                {/* Title */}
                <div className="space-y-2">
                    <label className="text-text-muted ml-1 text-[10px] font-black tracking-widest uppercase opacity-70">
                        Operational Sprint Title
                    </label>
                    <Input
                        placeholder="e.g. ALPHA SPRINT #4"
                        className="bg-bg-page/50 border-border focus-visible:ring-accent/20 h-14 rounded-2xl text-lg font-black italic shadow-none"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-text-muted ml-1 text-[10px] font-black tracking-widest uppercase opacity-70">
                        Strategic Briefing
                    </label>
                    <Textarea
                        placeholder="Define rules, goals, and prize pool..."
                        className="bg-bg-page/50 border-border focus-visible:ring-accent/20 h-32 rounded-2xl py-4 font-bold shadow-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-text-muted ml-1 text-[10px] font-black tracking-widest uppercase opacity-70">
                            Activation Timestamp
                        </label>
                        <Input
                            type="datetime-local"
                            className="bg-bg-page/50 border-border focus-visible:ring-accent/20 h-14 rounded-2xl font-black uppercase shadow-none"
                            value={formData.startTime}
                            onChange={(e) =>
                                setFormData({ ...formData, startTime: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-text-muted ml-1 text-[10px] font-black tracking-widest uppercase opacity-70">
                            Termination Timestamp
                        </label>
                        <Input
                            type="datetime-local"
                            className="bg-bg-page/50 border-border focus-visible:ring-accent/20 h-14 rounded-2xl font-black uppercase shadow-none"
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            required
                        />
                    </div>
                </div>

                {/* Problem Selection Area */}
                <div className="space-y-3">
                    <label className="text-text-muted ml-1 flex justify-between text-[10px] font-black tracking-widest uppercase opacity-70">
                        Operational Problem Set
                        <span className="text-accent font-black tracking-normal">
                            [{formData.problemIds.length} SELECTED]
                        </span>
                    </label>

                    <div className="border-border bg-bg-page/20 custom-scrollbar max-h-80 space-y-2 overflow-y-auto rounded-3xl border p-5">
                        {isLoadingProblems ? (
                            <div className="text-text-muted flex flex-col items-center py-12">
                                <Loader2 className="text-accent mb-3 h-10 w-10 animate-spin" />
                                <p className="text-[10px] font-black tracking-widest uppercase opacity-60">
                                    Scanning Problem Database...
                                </p>
                            </div>
                        ) : availableProblems.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {availableProblems.map((problem) => (
                                    <div
                                        key={problem._id}
                                        onClick={() => handleProblemSelect(problem._id)}
                                        className={`matte-surface flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all duration-300 hover:scale-[1.02] ${
                                            formData.problemIds.includes(problem._id)
                                                ? 'border-accent bg-accent/10 shadow-accent/10 shadow-lg'
                                                : 'border-border/50 bg-bg-page/40 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`flex size-6 items-center justify-center rounded-lg border-2 transition-all ${
                                                    formData.problemIds.includes(problem._id)
                                                        ? 'bg-accent border-accent scale-110 text-white'
                                                        : 'border-border bg-bg-page/50'
                                                }`}
                                            >
                                                {formData.problemIds.includes(problem._id) && (
                                                    <CheckCircle2 className="size-4" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold tracking-tight">
                                                    {problem.title}
                                                </span>
                                            </div>
                                        </div>
                                        <span
                                            className={`rounded-md px-2 py-1 text-[9px] font-black tracking-tighter uppercase ${
                                                problem.difficulty === 'hard'
                                                    ? 'bg-rose-500/20 text-rose-500'
                                                    : problem.difficulty === 'medium'
                                                      ? 'bg-amber-500/20 text-amber-500'
                                                      : 'bg-emerald-500/20 text-emerald-500'
                                            }`}
                                        >
                                            {problem.difficulty || 'Easy'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-text-muted py-12 text-center">
                                <p className="text-[10px] font-black tracking-widest uppercase italic opacity-40">
                                    Null Set: No Problems Available
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Final Action */}
                <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-accent hover:bg-accent/90 shadow-accent/20 h-16 w-full rounded-2xl text-[14px] font-black tracking-[0.2em] text-white uppercase shadow-2xl transition-all duration-300 hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-7 w-7 animate-spin" />
                        ) : (
                            <div className="flex items-center gap-4">
                                <Save className="h-6 w-6" /> COMMENCE CONTEST DEPLOYMENT
                            </div>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
