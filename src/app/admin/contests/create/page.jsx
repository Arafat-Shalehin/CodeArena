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

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        problemIds: [], // এখন এটি একটি Array হিসেবে কাজ করবে
    })

    // ১. ডাইনামিকভাবে প্রবলেম লিস্ট ফেচ করা
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

    // ২. চেকবক্স হ্যান্ডলার (ডাইনামিক সিলেকশন)
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
            return Swal.fire(
                'Wait!',
                'Please select at least one problem for the contest.',
                'warning'
            )
        }

        try {
            const res = await fetch('/api/contests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (data.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Contest created successfully!',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                }).then(() => {
                    router.push('/admin/contests')
                })
            } else {
                Swal.fire('Error', data.message || 'Failed to create contest', 'error')
            }
        } catch (error) {
            Swal.fire('Error', 'Something went wrong on the server', 'error')
        }
    }

    return (
        <div className="mx-auto max-w-3xl p-10">
            <h1 className="text-text-primary mb-6 flex items-center gap-2 text-2xl font-black tracking-tighter uppercase">
                <Plus className="text-accent size-7" /> Create New Contest
            </h1>

            <form
                onSubmit={handleSubmit}
                className="border-border space-y-6 rounded-3xl border bg-white p-8 shadow-sm"
            >
                {/* Title */}
                <div className="space-y-1">
                    <label className="text-text-muted ml-1 text-[10px] font-black uppercase">
                        Contest Title
                    </label>
                    <Input
                        placeholder="e.g. Weekly Coding Challenge #1"
                        className="h-12 rounded-xl font-bold"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                {/* Description */}
                <div className="space-y-1">
                    <label className="text-text-muted ml-1 text-[10px] font-black uppercase">
                        Description
                    </label>
                    <Textarea
                        placeholder="Describe the contest rules and details..."
                        className="h-32 rounded-xl py-3 font-bold"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-text-muted ml-1 text-[10px] font-black uppercase">
                            Start Time
                        </label>
                        <Input
                            type="datetime-local"
                            className="h-12 rounded-xl font-bold"
                            value={formData.startTime}
                            onChange={(e) =>
                                setFormData({ ...formData, startTime: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-text-muted ml-1 text-[10px] font-black uppercase">
                            End Time
                        </label>
                        <Input
                            type="datetime-local"
                            className="h-12 rounded-xl font-bold"
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            required
                        />
                    </div>
                </div>

                {/* Dynamic Problem Selection Area */}
                <div className="space-y-2">
                    <label className="text-text-muted ml-1 flex justify-between text-[10px] font-black uppercase">
                        Select Problems
                        <span className="text-accent">{formData.problemIds.length} Selected</span>
                    </label>

                    <div className="border-border bg-bg-page/30 custom-scrollbar max-h-60 space-y-2 overflow-y-auto rounded-2xl border p-4">
                        {isLoadingProblems ? (
                            <div className="text-text-muted flex flex-col items-center py-6">
                                <Loader2 className="mb-2 animate-spin" />
                                <span className="text-xs font-bold uppercase italic">
                                    Loading Problems...
                                </span>
                            </div>
                        ) : availableProblems.length > 0 ? (
                            availableProblems.map((problem) => (
                                <div
                                    key={problem._id}
                                    onClick={() => handleProblemSelect(problem._id)}
                                    className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-3 transition-all ${
                                        formData.problemIds.includes(problem._id)
                                            ? 'border-accent bg-accent/5'
                                            : 'border-transparent bg-white hover:border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex size-5 items-center justify-center rounded-md border transition-colors ${
                                                formData.problemIds.includes(problem._id)
                                                    ? 'bg-accent border-accent'
                                                    : 'border-gray-300 bg-white'
                                            }`}
                                        >
                                            {formData.problemIds.includes(problem._id) && (
                                                <CheckCircle2 className="size-4 text-white" />
                                            )}
                                        </div>
                                        <span className="text-sm font-bold">{problem.title}</span>
                                    </div>
                                    <span className="text-text-muted rounded-md bg-gray-100 px-2 py-1 text-[10px] font-black tracking-tighter uppercase">
                                        {problem.difficulty || 'Easy'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-text-muted py-6 text-center text-xs font-bold italic">
                                No problems found in database.
                            </p>
                        )}
                    </div>
                </div>

                <Button
                    type="submit"
                    className="bg-accent hover:bg-accent/90 h-14 w-full rounded-2xl font-black tracking-widest text-white uppercase shadow-lg transition-all active:scale-[0.98]"
                >
                    <Save className="mr-2 size-5" /> Save Contest
                </Button>
            </form>
        </div>
    )
}
