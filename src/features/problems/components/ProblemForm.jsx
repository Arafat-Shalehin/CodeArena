'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Swal from 'sweetalert2'
import { Save, Code2, RefreshCcw, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const problemSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    description: z.string().min(20, 'Description is too short'),
    tags: z.string().min(1, 'At least one tag is required'),
    timeLimit: z.coerce.number().min(0.1).max(10),
    memoryLimit: z.coerce.number().min(16).max(1024),
})

const defaultValues = {
    difficulty: 'easy',
    timeLimit: 1,
    memoryLimit: 256,
}

export default function ProblemForm({ mode = 'create', defaultData, onSubmit: onSuccess }) {
    const isEdit = mode === 'edit'

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(problemSchema),
        defaultValues: isEdit ? {} : defaultValues,
        values:
            isEdit && defaultData
                ? {
                      title: defaultData.title || '',
                      difficulty: defaultData.difficulty || 'easy',
                      description: defaultData.description || '',
                      tags: Array.isArray(defaultData.tags)
                          ? defaultData.tags.join(', ')
                          : defaultData.tags || '',
                      timeLimit: defaultData.timeLimit || 1,
                      memoryLimit: defaultData.memoryLimit || 256,
                  }
                : undefined,
    })

    const difficultyValue = watch('difficulty')

    const onSubmit = async (data) => {
        const formattedData = {
            ...data,
            tags: data.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag !== ''),
        }

        try {
            const url = isEdit ? `/api/problems/${defaultData?._id}` : '/api/problems'
            const method = isEdit ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedData),
            })

            const result = await res.json()

            if (result.success) {
                await Swal.fire({
                    title: isEdit ? 'Update Successful' : 'Problem Created',
                    text: isEdit
                        ? 'The problem database has been updated.'
                        : 'Your new challenge is now live in the system.',
                    icon: 'success',
                    background: 'var(--ca-bg-page)',
                    color: 'var(--ca-text-primary)',
                    confirmButtonColor: 'var(--ca-accent)',
                })
                onSuccess?.()
            } else {
                Swal.fire({
                    title: 'System Error',
                    text: result.error || result.message || 'Operation failed',
                    icon: 'error',
                    background: 'var(--ca-bg-page)',
                    color: 'var(--ca-text-primary)',
                })
            }
        } catch (error) {
            Swal.fire({
                title: 'Request Failed',
                text: 'Connection to problem service was interrupted.',
                icon: 'error',
                background: 'var(--ca-bg-page)',
                color: 'var(--ca-text-primary)',
            })
        }
    }

    return (
        <Card className="matte-surface border-border bg-bg-subtle/40 overflow-hidden rounded-3xl border shadow-2xl">
            <CardHeader className="border-border/50 bg-bg-muted/10 border-b px-8 pb-8 md:px-10">
                <div className="flex items-center gap-5">
                    <div className="bg-accent border-accent/20 shadow-accent/20 flex h-14 w-14 items-center justify-center rounded-2xl border-4 shadow-xl">
                        {isEdit ? (
                            <RefreshCcw className="h-7 w-7 text-white" />
                        ) : (
                            <Code2 className="h-7 w-7 text-white" />
                        )}
                    </div>
                    <div>
                        <CardTitle className="text-text-primary text-2xl font-semibold tracking-tight">
                            {isEdit ? 'Refactor' : 'Create'}{' '}
                            <span className="text-accent">
                                {isEdit ? 'Challenge' : 'New Problem'}
                            </span>
                        </CardTitle>
                        <CardDescription className="text-text-muted mt-1 text-xs font-medium tracking-wide opacity-70">
                            {isEdit
                                ? `Editing record: ${defaultData?._id?.toUpperCase()}`
                                : 'Create and publish a new coding problem.'}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-8 md:p-10">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-2">
                        <Label
                            htmlFor="title"
                            className="text-text-muted ml-1 text-xs font-semibold tracking-wide uppercase opacity-75"
                        >
                            Problem Title
                        </Label>
                        <Input
                            id="title"
                            {...register('title')}
                            placeholder="e.g. Longest Substring Logic"
                            className={`bg-bg-page/50 border-border focus-within:border-accent/40 focus-visible:ring-accent/20 h-12 rounded-xl text-sm font-medium shadow-none transition-all ${errors.title ? 'border-rose-500/50 focus-visible:ring-rose-500/20' : ''}`}
                        />
                        {errors.title && (
                            <p className="ml-1 flex items-center gap-1.5 text-xs font-medium tracking-tight text-rose-500">
                                <AlertCircle className="h-3 w-3" /> {errors.title.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="description"
                            className="text-text-muted ml-1 text-xs font-semibold tracking-wide uppercase opacity-75"
                        >
                            Description (Markdown)
                        </Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Detail the challenge requirements, constraints, and operational flow..."
                            className={`bg-bg-page/50 border-border focus-within:border-accent/40 focus-visible:ring-accent/20 min-h-45 rounded-xl py-4 text-sm font-medium shadow-none transition-all ${errors.description ? 'border-rose-500/50' : ''}`}
                        />
                        {errors.description && (
                            <p className="ml-1 text-xs font-medium tracking-tight text-rose-500">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-text-muted ml-1 text-xs font-semibold tracking-wide uppercase opacity-75">
                                Difficulty
                            </Label>
                            <Select
                                value={difficultyValue}
                                onValueChange={(val) => setValue('difficulty', val)}
                            >
                                <SelectTrigger className="bg-bg-page/50 border-border focus:ring-accent/20 h-12 rounded-xl text-sm font-medium shadow-none">
                                    <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent className="matte-surface border-border bg-bg-page rounded-xl shadow-2xl">
                                    <SelectItem value="easy" className="text-sm font-medium">
                                        Beginner
                                    </SelectItem>
                                    <SelectItem value="medium" className="text-sm font-medium">
                                        Intermediate
                                    </SelectItem>
                                    <SelectItem value="hard" className="text-sm font-medium">
                                        Expert
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-text-muted ml-1 text-xs font-semibold tracking-wide uppercase opacity-75">
                                Tags (Comma Separated)
                            </Label>
                            <Input
                                {...register('tags')}
                                placeholder="dp, binary-tree, arrays"
                                className="bg-bg-page/50 border-border focus-visible:ring-accent/20 h-12 rounded-xl text-sm font-medium shadow-none"
                            />
                            {errors.tags && (
                                <p className="ml-1 text-xs font-medium tracking-tight text-rose-500">
                                    {errors.tags.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-text-muted ml-1 text-xs font-semibold tracking-wide uppercase opacity-75">
                                Time Limit (Seconds)
                            </Label>
                            <Input
                                type="number"
                                step="0.1"
                                {...register('timeLimit')}
                                className="bg-bg-page/50 border-border focus-visible:ring-accent/20 h-12 rounded-xl text-sm font-medium shadow-none"
                            />
                            {errors.timeLimit && (
                                <p className="ml-1 text-xs font-medium tracking-tight text-rose-500">
                                    {errors.timeLimit.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-text-muted ml-1 text-xs font-semibold tracking-wide uppercase opacity-75">
                                Memory Limit (MB)
                            </Label>
                            <Input
                                type="number"
                                {...register('memoryLimit')}
                                className="bg-bg-page/50 border-border focus-visible:ring-accent/20 h-12 rounded-xl text-sm font-medium shadow-none"
                            />
                            {errors.memoryLimit && (
                                <p className="ml-1 text-xs font-medium tracking-tight text-rose-500">
                                    {errors.memoryLimit.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-accent hover:bg-accent/90 shadow-accent/20 h-14 w-full rounded-2xl text-sm font-semibold text-white shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Save className="h-5 w-5" />{' '}
                                    {isEdit ? 'Update Problem' : 'Create Problem'}
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
