'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProblemsSidebar from '@/features/problems/components/ProblemsSidebar'
import ProblemsToolbar from '@/features/problems/components/ProblemsToolbar'
import ProblemsTable from '@/features/problems/components/ProblemsTable'

const ITEMS_PER_PAGE = 20
// Debounce delay (ms) for search input before triggering an API call
const SEARCH_DEBOUNCE_MS = 400

export default function ProblemsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [sortBy, setSortBy] = useState('Difficulty')

    // --- Filter state (drives server-side query params) ---
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDifficulties, setSelectedDifficulties] = useState([])
    const [selectedTopics, setSelectedTopics] = useState([])

    // NOTE: selectedStatuses (solved / attempted) is passed to the sidebar for UI
    // consistency, but it cannot be server-filtered until per-user submission
    // history is tracked. Filtering by status is silently ignored by the API.
    const [selectedStatuses, setSelectedStatuses] = useState([])

    // --- Pagination state ---
    const [currentPage, setCurrentPage] = useState(1)

    // --- API response state ---
    const [problems, setProblems] = useState([])
    const [pagination, setPagination] = useState(null)
    const [solvedIds, setSolvedIds] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    // Ref to hold the active debounce timer for search
    const searchDebounceRef = useRef(null)

    /**
     * Core data-fetching function.
     * Builds query params from current filter/pagination state and calls GET /api/problems.
     * Wrapped in useCallback so it can be referenced as a stable dependency in useEffect.
     */
    const fetchProblems = useCallback(
        async (page = 1) => {
            setIsLoading(true)
            setError(null)

            try {
                const params = new URLSearchParams()
                params.set('page', page)
                params.set('limit', ITEMS_PER_PAGE)

                // The API supports a single difficulty value — when multiple are selected
                // we send the first one for now (multi-difficulty requires $or on the backend).
                // TODO: extend the backend to accept comma-separated difficulties if needed.
                if (selectedDifficulties.length === 1) {
                    params.set('difficulty', selectedDifficulties[0].toLowerCase())
                }

                if (searchQuery.trim()) {
                    params.set('search', searchQuery.trim())
                }

                if (selectedTopics.length === 1) {
                    params.set('tag', selectedTopics[0])
                }

                const res = await fetch(`/api/problems?${params.toString()}`)

                if (!res.ok) {
                    const body = await res.json().catch(() => ({}))
                    throw new Error(body.message || `Request failed with status ${res.status}`)
                }

                const json = await res.json()

                // API returns: { success, data: [...problems], pagination: { total, page, limit, pages } }
                setProblems(json.data || [])
                setPagination(json.pagination || null)
            } catch (err) {
                console.error('[ProblemsPage] Failed to fetch problems:', err)
                setError(err.message || 'Something went wrong. Please try again.')
                setProblems([])
            } finally {
                setIsLoading(false)
            }
        },
        [selectedDifficulties, selectedTopics, searchQuery]
    )

    /**
     * Fetch the list of problem IDs solved by the user.
     */
    const fetchSolvedStatus = useCallback(async () => {
        try {
            const res = await fetch('/api/user/problems-status')
            const json = await res.json()
            if (json.success) {
                setSolvedIds(json.data.solvedIds || [])
            }
        } catch (err) {
            console.error('[ProblemsPage] Failed to fetch solved status:', err)
        }
    }, [])

    /**
     * Re-fetch whenever filters change.
     * Always resets to page 1 on filter change to avoid showing an out-of-range page.
     */
    useEffect(() => {
        setCurrentPage(1)
        fetchProblems(1)
        fetchSolvedStatus()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDifficulties, selectedTopics])

    /**
     * Debounced re-fetch when search query changes.
     * Avoids hammering the API on every keystroke.
     */
    useEffect(() => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
        searchDebounceRef.current = setTimeout(() => {
            setCurrentPage(1)
            fetchProblems(1)
        }, SEARCH_DEBOUNCE_MS)
        return () => clearTimeout(searchDebounceRef.current)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery])

    /** Re-fetch when the user changes pages. */
    const handlePageChange = useCallback(
        (page) => {
            setCurrentPage(page)
            fetchProblems(page)
        },
        [fetchProblems]
    )

    // --- Filter toggle helpers ---
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
        // Clearing filters will trigger the useEffect hooks above to re-fetch
    }

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
                        <ProblemsTable
                            problems={problems}
                            pagination={pagination}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                            solvedIds={solvedIds}
                            isLoading={isLoading}
                            error={error}
                        />
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
