'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import {
    Search,
    Loader2,
    Grid3X3,
    List,
    BookOpen,
    Zap,
    Activity,
    Flame,
    ArrowRight,
    Hash,
    Puzzle,
    BarChart3,
    Type,
    Calculator,
    ArrowDownUp,
    Target,
    TreePine,
    Network,
    Radio,
    MousePointer2,
    Link2,
    Library,
    Repeat,
    Gamepad2,
    Maximize,
    Undo2,
    Swords,
    Plus,
    Inbox,
    Mountain,
    Globe,
    ChevronDown,
    Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import PracticeSidebar from '@/features/practice/components/PracticeSidebar'
import PracticeToolbar from '@/features/practice/components/PracticeToolbar'

const DIFFICULTY_COLORS = {
    easy: { bar: 'bg-success', text: 'text-success' },
    medium: { bar: 'bg-warning', text: 'text-warning' },
    hard: { bar: 'bg-error', text: 'text-error' },
}

const TAG_ICONS = {
    'dynamic programming': Puzzle,
    array: BarChart3,
    string: Type,
    'hash table': Hash,
    math: Calculator,
    sorting: ArrowDownUp,
    greedy: Target,
    'binary search': Target,
    tree: TreePine,
    graph: Network,
    'depth-first search': Search,
    'breadth-first search': Radio,
    'two pointers': MousePointer2,
    'linked list': Link2,
    stack: Library,
    'bit manipulation': Zap,
    recursion: Repeat,
    simulation: Gamepad2,
    'sliding window': Maximize,
    backtracking: Undo2,
    matrix: Grid3X3,
    'divide and conquer': Swords,
    'prefix sum': Plus,
    queue: Inbox,
    heap: Mountain,
    trie: Globe,
}

function getTagIcon(tag) {
    const key = String(tag || '').toLowerCase()
    const Icon = TAG_ICONS[key] || Hash
    return <Icon className="text-accent h-5 w-5" />
}

export default function PracticePage() {
    const [tagGroups, setTagGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDifficulty, setSelectedDifficulty] = useState('all')
    const [viewMode, setViewMode] = useState('grid')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleClearFilters = () => {
        setSearchQuery('')
        setSelectedDifficulty('all')
    }

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const res = await fetch('/api/problems/by-tag')
                const json = await res.json()
                if (json.success) {
                    setTagGroups(json.data)
                } else {
                    setError('Failed to load topics')
                }
            } catch (err) {
                console.error('Failed to fetch tag groups:', err)
                setError('Failed to load topics')
            } finally {
                setLoading(false)
            }
        }
        fetchTags()
    }, [])

    const filtered = tagGroups.filter((g) => {
        const tag = String(g?.tag || '')
        const searchTerm = String(searchQuery || '').toLowerCase()
        const matchesSearch = tag.toLowerCase().includes(searchTerm)
        const matchesDifficulty =
            selectedDifficulty === 'all' || (g.difficulties?.[selectedDifficulty] || 0) > 0
        return matchesSearch && matchesDifficulty
    })

    const totalProblems = tagGroups.reduce((sum, g) => sum + (g.count || 0), 0)

    return (
        <div className="bg-bg-page site-gradient text-text-primary flex min-h-screen flex-col font-sans">
            <Navbar />

            <main className="max-w-container mx-auto w-full flex-grow px-4 py-8 md:px-6">
                <div className="flex flex-col gap-8 lg:flex-row">
                    <PracticeSidebar
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedDifficulty={selectedDifficulty}
                        setSelectedDifficulty={setSelectedDifficulty}
                        handleClearFilters={handleClearFilters}
                    />

                    <section className="min-w-0 flex-1 space-y-6">
                        <PracticeToolbar
                            setSidebarOpen={setSidebarOpen}
                            totalProblems={totalProblems}
                            totalTopics={tagGroups.length}
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                        />

                        {/* Content */}
                        {loading ? (
                            <div className="flex min-h-[40vh] items-center justify-center">
                                <Loader2 className="text-accent h-8 w-8 animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="bg-bg-subtle border-border rounded-lg border p-12 text-center">
                                <BookOpen className="text-text-muted mx-auto mb-4 h-12 w-12 opacity-50" />
                                <h3 className="text-text-primary mb-2 text-lg font-semibold">
                                    {error}
                                </h3>
                                <p className="text-text-secondary text-sm">
                                    Please try again later.
                                </p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="bg-bg-subtle border-border rounded-lg border p-12 text-center">
                                <Search className="text-text-muted mx-auto mb-4 h-12 w-12 opacity-50" />
                                <h3 className="text-text-primary mb-2 text-lg font-semibold">
                                    No topics found
                                </h3>
                                <p className="text-text-secondary text-sm">
                                    Try a different search term.
                                </p>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {filtered.map((group, index) => {
                                    const key = group.tag || group.id || `tag-${index}`
                                    return <TagCard key={key} group={group} />
                                })}
                            </div>
                        ) : (
                            <div className="border-border bg-bg-page overflow-hidden rounded-xl border shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-left">
                                        <thead>
                                            <tr className="bg-bg-subtle border-border border-b">
                                                <th className="text-text-muted w-16 px-6 py-3 text-xs font-medium tracking-wide uppercase">
                                                    Topic
                                                </th>
                                                <th className="text-text-muted px-6 py-3 text-xs font-medium tracking-wide uppercase">
                                                    Name
                                                </th>
                                                <th className="text-text-muted hidden px-6 py-3 text-xs font-medium tracking-wide uppercase sm:table-cell">
                                                    Problems
                                                </th>
                                                <th className="text-text-muted px-6 py-3 text-xs font-medium tracking-wide uppercase">
                                                    Difficulty Distribution
                                                </th>
                                                <th className="text-text-muted w-24 px-6 py-3 text-right text-xs font-medium tracking-wide uppercase">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map((group, index) => {
                                                const key = group.tag || group.id || `tag-${index}`
                                                return <TagRow key={key} group={group} />
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    )
}

function DifficultyBar({ difficulties = {}, count = 0 }) {
    const easyCount = Number(difficulties?.easy || 0)
    const medCount = Number(difficulties?.medium || 0)
    const hardCount = Number(difficulties?.hard || 0)
    const total = Number(count || easyCount + medCount + hardCount || 1)

    const easyPct = (easyCount / total) * 100
    const medPct = (medCount / total) * 100
    const hardPct = (hardCount / total) * 100

    return (
        <div className="flex items-center gap-3">
            <div className="bg-border h-1.5 flex-1 overflow-hidden rounded-full">
                <div className="flex h-full">
                    <div className="bg-success h-full" style={{ width: `${easyPct}%` }} />
                    <div className="bg-warning h-full" style={{ width: `${medPct}%` }} />
                    <div className="bg-error h-full" style={{ width: `${hardPct}%` }} />
                </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className="text-success">{easyCount}E</span>
                <span className="text-warning">{medCount}M</span>
                <span className="text-error">{hardCount}H</span>
            </div>
        </div>
    )
}

function TagCard({ group }) {
    const { tag, count, difficulties } = group
    const icon = getTagIcon(tag)

    return (
        <Link href={`/practice/${encodeURIComponent(tag)}`} className="group block">
            <div className="bg-bg-subtle border-border hover:border-accent/50 flex h-full flex-col rounded-xl border p-5 shadow-sm transition-all hover:shadow-md">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                    <div className="bg-bg-muted flex h-10 w-10 items-center justify-center rounded-lg text-lg">
                        {icon}
                    </div>
                    <span className="text-text-muted bg-bg-muted rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                        {count} {count === 1 ? 'problem' : 'problems'}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-text-primary group-hover:text-accent mb-3 text-base font-bold tracking-tight transition-colors">
                    {tag}
                </h3>

                {/* Difficulty Bar */}
                <div className="mt-auto">
                    <DifficultyBar difficulties={difficulties} count={count} />
                </div>

                {/* Footer */}
                <div className="border-border mt-4 flex items-center justify-between border-t pt-3">
                    <span className="text-text-muted text-[10px] font-bold tracking-wider uppercase">
                        Start Practicing
                    </span>
                    <ArrowRight className="text-text-muted/60 group-hover:text-accent h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    )
}

function TagRow({ group }) {
    const { tag, count, difficulties } = group
    const icon = getTagIcon(tag)

    return (
        <tr className="border-border hover:bg-bg-subtle duration-fast group cursor-pointer border-t transition-colors">
            <td className="px-6 py-4">
                <div className="bg-bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
                    {icon}
                </div>
            </td>
            <td className="px-6 py-4">
                <Link
                    href={`/practice/${encodeURIComponent(tag)}`}
                    className="text-text-primary group-hover:text-accent text-sm font-bold transition-colors"
                >
                    {tag}
                </Link>
            </td>
            <td className="text-text-muted hidden px-6 py-4 text-xs font-bold sm:table-cell">
                {count} {count === 1 ? 'problem' : 'problems'}
            </td>
            <td className="px-6 py-4">
                <DifficultyBar difficulties={difficulties} count={count} />
            </td>
            <td className="px-6 py-4 text-right">
                <Link
                    href={`/practice/${encodeURIComponent(tag)}`}
                    className="text-text-muted/60 group-hover:text-accent inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase transition-colors"
                >
                    Start{' '}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
            </td>
        </tr>
    )
}
