'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Swal from 'sweetalert2'
import { motion } from 'framer-motion'
import { ChevronLeft, Save, Loader2, AlertCircle, RefreshCcw } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const problemSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    description: z.string().min(20, 'Description is too short'),
    tags: z.string().min(1, 'At least one tag is required'),
    timeLimit: z.coerce.number().min(0.1),
    memoryLimit: z.coerce.number().min(16),
})

export default function EditProblemPage() {
    const router = useRouter()
    const params = useParams()
    const [loading, setLoading] = useState(true)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(problemSchema),
    })

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const res = await fetch(`/api/problems/${params.id}`)
                const result = await res.json()

                if (result.success) {
                    const problemData = result.data
                    reset({
                        ...problemData,
                        tags: Array.isArray(problemData.tags)
                            ? problemData.tags.join(', ')
                            : problemData.tags,
                    })
                } else {
                    Swal.fire('Error', 'Problem not found', 'error')
                    router.push('/admin/problems')
                }
            } catch (error) {
                console.error('Fetch error:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProblem()
    }, [params.id, reset, router])

    const onSubmit = async (data) => {
        try {
            const formattedData = {
                ...data,
                tags: data.tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter((tag) => tag !== ''),
            }

            const res = await fetch(`/api/problems/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedData),
            })

            const result = await res.json()

            if (result.success) {
                const alertResult = await Swal.fire({
                    title: 'Updated Successfully!',
                    text: 'The problem has been updated in the database.',
                    icon: 'success',
                    confirmButtonColor: '#00bc7d',
                    confirmButtonText: 'OK',
                })

                if (alertResult.isConfirmed) {
                    router.push('/admin/problems')
                    router.refresh()
                }
            } else {
                Swal.fire('Update Failed', result.message || 'Check your input data', 'error')
            }
        } catch (error) {
            Swal.fire('Error', 'Network error. Please try again.', 'error')
        }
    }

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                <p className="font-medium text-slate-500">Loading problem details...</p>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto max-w-4xl px-4 pb-10"
        >
            <div className="mb-6">
                <Link
                    href="/admin/problems"
                    className="flex items-center text-sm text-slate-500 transition-colors hover:text-emerald-600"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back to Dashboard
                </Link>
            </div>

            <Card className="border-none bg-white/90 shadow-2xl backdrop-blur-sm">
                <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                            <RefreshCcw className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold text-slate-800">
                                Edit Problem
                            </CardTitle>
                            <CardDescription>Update details for ID: {params.id}</CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="font-semibold text-slate-700">Problem Title</Label>
                            <Input
                                {...register('title')}
                                className={errors.title ? 'border-rose-500' : ''}
                            />
                            {errors.title && (
                                <p className="text-xs text-rose-500">{errors.title.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold text-slate-700">Description</Label>
                            <Textarea
                                {...register('description')}
                                className={`min-h-[200px] ${errors.description ? 'border-rose-500' : ''}`}
                            />
                            {errors.description && (
                                <p className="text-xs text-rose-500">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700">
                                    Difficulty Level
                                </Label>
                                <select
                                    {...register('difficulty')}
                                    className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700">
                                    Tags (Comma separated)
                                </Label>
                                <Input {...register('tags')} placeholder="dp, array, math" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700">
                                    Time Limit (s)
                                </Label>
                                <Input type="number" step="0.1" {...register('timeLimit')} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700">
                                    Memory Limit (MB)
                                </Label>
                                <Input type="number" {...register('memoryLimit')} />
                            </div>
                        </div>

                        <div className="flex gap-4 border-t border-slate-200 pt-6">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-11 flex-1 bg-emerald-600 hover:bg-emerald-700"
                            >
                                {isSubmitting ? (
                                    'Updating...'
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Save className="h-4 w-4" /> Update Problem
                                    </span>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="h-11"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    )
}
