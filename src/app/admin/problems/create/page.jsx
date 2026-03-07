'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Swal from 'sweetalert2'
import { motion } from 'framer-motion'
import { ChevronLeft, Save, Code2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

// Shadcn UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

// Validation Schema with Zod
const problemSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    description: z.string().min(20, 'Description is too short'),
    tags: z.string().min(1, 'At least one tag is required'),
    timeLimit: z.coerce.number().min(0.1).max(10),
    memoryLimit: z.coerce.number().min(16).max(1024),
})

export default function CreateProblemPage() {
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(problemSchema),
        defaultValues: {
            difficulty: 'easy',
            timeLimit: 1,
            memoryLimit: 256,
        },
    })

    const onSubmit = async (data) => {
        try {
            const formattedData = {
                ...data,
                tags: data.tags.split(',').map((tag) => tag.trim()), // Clean up tags
            }

            const res = await fetch('/api/problems', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedData),
            })

            const result = await res.json()

            if (result.success) {
                await Swal.fire({
                    title: 'Problem Created!',
                    text: 'Your challenge has been added to the database.',
                    icon: 'success',
                    confirmButtonColor: '#00bc7d',
                })
                router.push('/admin/problems')
                router.refresh()
            } else {
                Swal.fire('Error', result.error || 'Failed to create problem', 'error')
            }
        } catch (error) {
            Swal.fire('Error', 'Server connection failed', 'error')
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl pb-10"
        >
            {/* Navigation Header */}
            <div className="mb-6 flex items-center justify-between">
                <Link
                    href="/admin/problems"
                    className="flex items-center text-sm text-slate-500 transition-colors hover:text-slate-800"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back to Problems
                </Link>
            </div>

            <Card className="border-none bg-white/80 shadow-xl backdrop-blur-md">
                <CardHeader className="border-b border-slate-200 bg-slate-50/0">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                            <Code2 className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold">Create New Problem</CardTitle>
                            <CardDescription>
                                Fill in the details to publish a new coding challenge.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Title Section */}
                        <div className="space-y-2">
                            <Label htmlFor="title" className="font-semibold text-slate-700">
                                Problem Title
                            </Label>
                            <Input
                                id="title"
                                {...register('title')}
                                placeholder="e.g. Longest Substring Without Repeating Characters"
                                className={
                                    errors.title
                                        ? 'border-rose-500 focus:ring-rose-500'
                                        : 'focus:ring-emerald-500'
                                }
                            />
                            {errors.title && (
                                <p className="flex items-center gap-1 text-xs text-rose-500">
                                    <AlertCircle className="h-3 w-3" /> {errors.title.message}
                                </p>
                            )}
                        </div>

                        {/* Description Section */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="font-semibold text-slate-700">
                                Description (Markdown Supported)
                            </Label>
                            <Textarea
                                id="description"
                                {...register('description')}
                                placeholder="Describe the problem, constraints, and examples..."
                                className={`min-h-[200px] ${errors.description ? 'border-rose-500' : ''}`}
                            />
                            {errors.description && (
                                <p className="text-xs text-rose-500">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Difficulty */}
                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700">
                                    Difficulty Level
                                </Label>
                                <select
                                    {...register('difficulty')}
                                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700">
                                    Tags (Comma separated)
                                </Label>
                                <Input
                                    {...register('tags')}
                                    placeholder="dp, math, string, sliding-window"
                                />
                                {errors.tags && (
                                    <p className="text-xs text-rose-500">{errors.tags.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Time Limit */}
                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700">
                                    Time Limit (Seconds)
                                </Label>
                                <Input type="number" step="0.1" {...register('timeLimit')} />
                                {errors.timeLimit && (
                                    <p className="text-xs text-rose-500">
                                        {errors.timeLimit.message}
                                    </p>
                                )}
                            </div>

                            {/* Memory Limit */}
                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700">
                                    Memory Limit (MB)
                                </Label>
                                <Input type="number" {...register('memoryLimit')} />
                                {errors.memoryLimit && (
                                    <p className="text-xs text-rose-500">
                                        {errors.memoryLimit.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 border-t border-slate-200 pt-4">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-11 flex-1 bg-emerald-600 hover:bg-emerald-700"
                            >
                                {isSubmitting ? (
                                    'Publishing Challenge...'
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Save className="h-4 w-4" /> Save and Publish Problem
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
