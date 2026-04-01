import React, { useState, useMemo } from 'react'
import ProblemsSidebar from './ProblemsSidebar'
import ProblemsToolbar from './ProblemsToolbar'
import ProblemsTable from './ProblemsTable'
import { problems as initialProblems } from '../data/problems.data'

export default function ProblemsLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Search and Sort State
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('Difficulty')

    // Filter Arrays State
    const [selectedDifficulties, setSelectedDifficulties] = useState([])
    const [selectedStatuses, setSelectedStatuses] = useState([])
    const [selectedTopics, setSelectedTopics] = useState([])

    const handleClearFilters = () => {
        setSearchQuery('')
        setSelectedDifficulties([])
        setSelectedStatuses([])
        setSelectedTopics([])
    }

    const toggleFilter = (setFilterState, value) => {
        setFilterState((prev) =>
            prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
        )
    }

    const processedProblems = useMemo(() => {
        // 1. Filter
        let result = initialProblems.filter((p) => {
            // Search filter
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase())

            // Difficulty filter
            const matchesDifficulty =
                selectedDifficulties.length === 0 || selectedDifficulties.includes(p.difficulty)

            // Status filter
            const matchesStatus =
                selectedStatuses.length === 0 || selectedStatuses.includes(p.status)

            // Topic filter (Problem must have at least one of the selected topics, or no topics are selected)
            const matchesTopic =
                selectedTopics.length === 0 || p.tags.some((tag) => selectedTopics.includes(tag))

            return matchesSearch && matchesDifficulty && matchesStatus && matchesTopic
        })

        // 2. Sort
        result.sort((a, b) => {
            if (sortBy === 'Difficulty') {
                const diffOrder = { Easy: 1, Medium: 2, Hard: 3 }
                return diffOrder[a.difficulty] - diffOrder[b.difficulty]
            } else if (sortBy === 'Acceptance Rate') {
                return b.acceptance - a.acceptance // Highest acceptance first
            } else if (sortBy === 'Frequency') {
                // Parse submission strings like "21.6M" to numbers for comparison
                const parseFreq = (str) => {
                    const cleanStr = str.replace(/,/g, '')
                    if (cleanStr.endsWith('M')) return parseFloat(cleanStr) * 1000000
                    if (cleanStr.endsWith('K')) return parseFloat(cleanStr) * 1000
                    return parseFloat(cleanStr) || 0
                }
                return parseFreq(b.submissions) - parseFreq(a.submissions)
            } else if (sortBy === 'Most Recent') {
                // Approximate "Most Recent" using highest ID first
                return b.id - a.id
            }
            return 0
        })

        return result
    }, [
        initialProblems,
        searchQuery,
        selectedDifficulties,
        selectedStatuses,
        selectedTopics,
        sortBy,
    ])

    return (
        <div className="relative flex flex-col gap-8 lg:flex-row">
            <ProblemsSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedDifficulties={selectedDifficulties}
                toggleDifficulty={(val) => toggleFilter(setSelectedDifficulties, val)}
                selectedStatuses={selectedStatuses}
                toggleStatus={(val) => toggleFilter(setSelectedStatuses, val)}
                selectedTopics={selectedTopics}
                toggleTopic={(val) => toggleFilter(setSelectedTopics, val)}
                handleClearFilters={handleClearFilters}
            />

            <section className="min-w-0 flex-1 space-y-6">
                <ProblemsToolbar
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    setSidebarOpen={setSidebarOpen}
                />
                <ProblemsTable problems={processedProblems} />
            </section>
        </div>
    )
}
