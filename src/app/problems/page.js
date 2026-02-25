'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProblemsSidebar from '@/features/problems/components/ProblemsSidebar'
import ProblemsToolbar from '@/features/problems/components/ProblemsToolbar'
import ProblemsTable from '@/features/problems/components/ProblemsTable'
import { problems as initialProblems } from '@/features/problems/data/problems.data'

export default function ProblemsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('Difficulty')

    const [selectedDifficulties, setSelectedDifficulties] = useState([])
    const [selectedStatuses, setSelectedStatuses] = useState([])
    const [selectedTopics, setSelectedTopics] = useState([])

    const toggleDifficulty = (d) =>
        setSelectedDifficulties((prev) =>
            prev.includes(d) ? prev.filter((item) => item !== d) : [...prev, d]
        )

    const toggleStatus = (s) =>
        setSelectedStatuses((prev) =>
            prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
        )

    const toggleTopic = (t) =>
        setSelectedTopics((prev) =>
            prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
        )

    const handleClearFilters = () => {
        setSelectedDifficulties([])
        setSelectedStatuses([])
        setSelectedTopics([])
        setSearchQuery('')
    }

    const filtered = initialProblems.filter((p) => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesDiff =
            selectedDifficulties.length === 0 || selectedDifficulties.includes(p.difficulty)
        const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(p.status)
        const matchesTopic =
            selectedTopics.length === 0 || p.tags.some((tag) => selectedTopics.includes(tag))

        return matchesSearch && matchesDiff && matchesStatus && matchesTopic
    })

    return (
        <div className="bg-bg-page text-text-primary flex min-h-screen flex-col font-sans">
            <Navbar />

            <main className="max-w-container mx-auto w-full flex-grow px-4 py-8 md:px-6">
                {/* Breadcrumb */}
                <nav className="text-text-muted mb-8 flex items-center gap-1.5 text-sm">
                    <a href="/" className="hover:text-accent duration-normal transition-colors">
                        Home
                    </a>
                    <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                    <span className="text-text-primary font-medium">Problems</span>
                </nav>

                <div className="flex flex-col gap-8 lg:flex-row">
                    <ProblemsSidebar
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedDifficulties={selectedDifficulties}
                        toggleDifficulty={toggleDifficulty}
                        selectedStatuses={selectedStatuses}
                        toggleStatus={toggleStatus}
                        selectedTopics={selectedTopics}
                        toggleTopic={toggleTopic}
                        handleClearFilters={handleClearFilters}
                    />

                    <section className="min-w-0 flex-1 space-y-6">
                        <ProblemsToolbar
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            setSidebarOpen={setSidebarOpen}
                        />
                        <ProblemsTable problems={filtered} />
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
