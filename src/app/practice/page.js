'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { Search, Loader2, BookOpen } from 'lucide-react'
import PracticeSidebar from '@/features/practice/components/PracticeSidebar'
import PracticeToolbar from '@/features/practice/components/PracticeToolbar'
import TagCard from '@/features/practice/components/TagCard'
import TagRow from '@/features/practice/components/TagRow'

export default function PracticePage() {
    const [tagGroups, setTagGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDifficulty, setSelectedDifficulty] = useState('all')
    const [viewMode, setViewMode] = useState('grid')
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

                        {loading ? (
                            viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="bg-bg-subtle border-border animate-pulse rounded-xl border p-5"
                                        >
                                            <div className="bg-bg-muted mb-3 h-8 w-8 rounded-lg"></div>
                                            <div className="bg-bg-muted mb-2 h-4 w-3/4 rounded"></div>
                                            <div className="bg-bg-muted/60 mb-4 h-3 w-full rounded"></div>
                                            <div className="flex gap-2">
                                                <div className="bg-bg-muted h-5 w-12 rounded-full"></div>
                                                <div className="bg-bg-muted h-5 w-12 rounded-full"></div>
                                            </div>
                                        </div>
                                    ))}
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
                                                {Array.from({ length: 8 }).map((_, i) => (
                                                    <tr key={i} className="border-border border-b">
                                                        <td className="px-6 py-4">
                                                            <div className="bg-bg-muted h-4 w-6 animate-pulse rounded"></div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="bg-bg-muted h-4 w-32 animate-pulse rounded"></div>
                                                        </td>
                                                        <td className="hidden px-6 py-4 sm:table-cell">
                                                            <div className="bg-bg-muted h-4 w-8 animate-pulse rounded"></div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex gap-2">
                                                                <div className="bg-bg-muted h-4 w-16 animate-pulse rounded"></div>
                                                                <div className="bg-bg-muted h-4 w-16 animate-pulse rounded"></div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="bg-bg-muted ml-auto h-6 w-16 animate-pulse rounded"></div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
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
