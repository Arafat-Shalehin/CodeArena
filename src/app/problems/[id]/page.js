'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProblemEditor from '@/features/problems/components/ProblemEditor'
import { normalizeDifficulty, difficultyConfig } from '@/features/problems/data/problems.data'
import {
    ChevronLeft,
    BookOpen,
    Code2,
    CheckCircle2,
    Clock,
    Database,
    Tag as TagIcon,
    AlertCircle,
    Loader2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Markdown
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

export default function ProblemDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [problem, setProblem] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchProblem() {
            try {
                const res = await fetch(`/api/problems/${id}`)
                const json = await res.json()

                if (json.success) {
                    setProblem(json.data)
                } else {
                    setError(json.error || json.message || 'Problem not found')
                }
            } catch (err) {
                setError('Failed to load problem')
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        if (id) fetchProblem()
    }, [id])

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-bg-page">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-accent" />
                    <p className="text-text-muted font-medium animate-pulse">Initializing workspace...</p>
                </div>
            </div>
        )
    }

    if (error || !problem) {
        return (
            <div className="flex min-h-screen flex-col bg-bg-page">
                <Navbar />
                <main className="flex flex-1 items-center justify-center px-4">
                    <div className="text-center max-w-md p-8 border border-error/20 bg-error/5 rounded-2xl shadow-xl">
                        <AlertCircle className="mx-auto mb-4 h-16 w-16 text-error opacity-60" />
                        <h1 className="text-text-primary mb-2 text-2xl font-bold">Oops!</h1>
                        <p className="text-text-muted mb-6">{error || 'Something went wrong while fetching the problem.'}</p>
                        <button
                            onClick={() => router.push('/problems')}
                            className="text-accent hover:underline font-medium inline-flex items-center gap-1.5"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back to Problems
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    const normalizedDiff = normalizeDifficulty(problem.difficulty)
    const diff = difficultyConfig[normalizedDiff] || difficultyConfig.Medium

    return (
        <div className="flex min-h-screen flex-col bg-bg-page select-none">
            <Navbar />

            {/* Main Workspace */}
            <main className="flex h-[calc(100vh-64px)] w-full flex-col lg:flex-row overflow-hidden border-t border-border">

                {/* Left Side: Description (Scrollable) */}
                <section className="flex flex-1 flex-col overflow-y-auto border-r border-border bg-bg-page custom-scrollbar">
                    {/* Toolbar / Breadcrumb */}
                    <div className="flex h-12 items-center justify-between px-6 bg-bg-subtle border-b border-border sticky top-0 z-10">
                        <button
                            onClick={() => router.push('/problems')}
                            className="text-text-muted hover:text-accent flex items-center gap-1.5 text-xs font-medium transition-colors"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                            Back
                        </button>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className={`px-2 py-0 h-5 text-[10px] font-bold uppercase tracking-wider ${diff.badge}`}>
                                {normalizedDiff}
                            </Badge>
                            <div className="h-3 w-px bg-border mx-1" />
                            <div className="flex items-center gap-1 text-[10px] text-text-muted font-mono" title="Time Limit">
                                <Clock className="h-3 w-3" />
                                {problem.timeLimit}ms
                            </div>
                            <div className="h-3 w-px bg-border mx-1" />
                            <div className="flex items-center gap-1 text-[10px] text-text-muted font-mono" title="Memory Limit">
                                <Database className="h-3 w-3" />
                                {problem.memoryLimit >= 1024 ? `${(problem.memoryLimit / 1024).toFixed(0)}MB` : `${problem.memoryLimit}KB`}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 lg:p-10 space-y-8 max-w-4xl mx-auto w-full">
                        {/* Title & Stats */}
                        <div>
                            <h1 className="text-text-primary mb-4 text-3xl font-extrabold tracking-tight lg:text-4xl">
                                {problem.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-text-primary font-bold">{problem.acceptanceRate}%</span>
                                        <span className="text-text-muted text-xs">Acceptance</span>
                                    </div>
                                    <div className="w-16 bg-bg-muted rounded-full h-1.5 relative overflow-hidden">
                                        <div className={`absolute top-0 left-0 h-full ${diff.progress}`} style={{ width: `${problem.acceptanceRate}%` }} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-text-muted">
                                    <Database className="h-4 w-4 opacity-60" />
                                    <span><span className="font-semibold text-text-primary">{problem.totalSubmissions}</span> Submissions</span>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-border" />

                        {/* Content */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-lg font-bold text-text-primary">
                                <BookOpen className="h-5 w-5 text-accent" />
                                <h2>Problem Description</h2>
                            </div>

                            <div className="prose-markdown">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {problem.description}
                                </ReactMarkdown>
                            </div>
                        </div>

                        {/* Examples Section (Optional, if description doesn't already contain them) */}
                        {problem.examples && problem.examples.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-text-primary flex items-center gap-2 text-lg font-bold">
                                    <Code2 className="h-5 w-5 text-accent" />
                                    Examples
                                </h3>
                                <div className="space-y-4">
                                    {problem.examples.map((ex, i) => (
                                        <div key={i} className="border border-border bg-bg-subtle rounded-xl p-4 font-mono text-sm">
                                            <div className="mb-2 text-xs font-bold text-text-muted uppercase tracking-widest">Example {i + 1}</div>
                                            <div className="grid gap-2">
                                                <div><span className="text-accent/70">Input:</span> <span className="text-text-primary">{ex.input}</span></div>
                                                <div><span className="text-accent/70">Output:</span> <span className="text-text-primary">{ex.output}</span></div>
                                                {ex.explanation && (
                                                    <div className="mt-2 pt-2 border-t border-border border-dashed text-text-muted italic">
                                                        {ex.explanation}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {problem.tags && problem.tags.length > 0 && (
                            <div className="pt-8">
                                <h4 className="text-text-muted mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                    <TagIcon className="h-3 w-3" />
                                    Related Topics
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {problem.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="bg-bg-subtle border-border hover:border-accent/40 text-[10px] font-medium transition-colors">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Spacer for bottom overflow */}
                        <div className="h-12" />
                    </div>
                </section>

                {/* Right Side: Editor (Fixed Height) */}
                <section className="flex flex-col flex-1 lg:flex-[1.2] bg-[#1e1e1e]">
                    <ProblemEditor problemId={id} />
                </section>

            </main>
        </div>
    )
}
