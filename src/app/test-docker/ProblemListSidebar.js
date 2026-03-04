'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, ArrowUpDown, Filter, Shuffle, CheckCircle2, ChevronRight } from 'lucide-react'

const DIFFICULTY_LABELS = {
    easy: { text: 'Easy', color: 'text-[#00b8a3]' },
    medium: { text: 'Med.', color: 'text-[#ffc01e]' },
    hard: { text: 'Hard', color: 'text-[#ff375f]' },
}

export default function ProblemListSidebar({
    isOpen,
    onClose,
    problems = [],
    selectedProblemId,
    onSelectProblem,
    solvedIds = [],
    onShuffle,
}) {
    const [searchQuery, setSearchQuery] = useState('')
    const [sortAsc, setSortAsc] = useState(true)
    const [filterDifficulty, setFilterDifficulty] = useState(null) // null = all
    const [showFilterDropdown, setShowFilterDropdown] = useState(false)
    const sidebarRef = useRef(null)
    const filterRef = useRef(null)

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                onClose()
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen, onClose])

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [isOpen, onClose])

    // Close filter dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setShowFilterDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    // Filter & sort
    const filteredProblems = problems
        .filter((p) => {
            if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()))
                return false
            if (filterDifficulty && p.difficulty !== filterDifficulty) return false
            return true
        })
        .sort((a, b) => {
            const titleA = a.title.toLowerCase()
            const titleB = b.title.toLowerCase()
            return sortAsc ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA)
        })

    const solvedCount = solvedIds.length
    const totalCount = problems.length
    const progressPercent = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[60] bg-black/60"
                    />

                    {/* Sidebar */}
                    <motion.div
                        ref={sidebarRef}
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed top-0 left-0 z-[70] flex h-full w-[380px] flex-col bg-[#282828] shadow-2xl"
                        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                    >
                        {/* ─── Header ─── */}
                        <div className="flex flex-shrink-0 flex-col border-b border-[#3a3a3a]">
                            {/* Title bar */}
                            <div className="flex items-center justify-between px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-white">Problem List</h2>
                                    <ChevronRight size={16} className="text-gray-500" />
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Progress circle */}
                                    <div className="flex items-center gap-2">
                                        <div className="relative h-5 w-5">
                                            <svg className="h-5 w-5 -rotate-90" viewBox="0 0 20 20">
                                                <circle
                                                    cx="10"
                                                    cy="10"
                                                    r="8"
                                                    fill="none"
                                                    stroke="#3a3a3a"
                                                    strokeWidth="2"
                                                />
                                                <circle
                                                    cx="10"
                                                    cy="10"
                                                    r="8"
                                                    fill="none"
                                                    stroke="#00b8a3"
                                                    strokeWidth="2"
                                                    strokeDasharray={`${progressPercent * 0.5} 50`}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {solvedCount}/{totalCount} Solved
                                        </span>
                                    </div>
                                    {/* Close button */}
                                    <button
                                        onClick={onClose}
                                        className="rounded-md p-1 text-gray-400 transition-colors hover:bg-[#3a3a3a] hover:text-white"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Search + Filter bar */}
                            <div className="flex items-center gap-2 px-5 pb-3">
                                {/* Search */}
                                <div className="flex flex-1 items-center gap-2 rounded-lg bg-[#3a3a3a] px-3 py-2">
                                    <Search size={14} className="text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search questions"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-transparent text-sm text-gray-300 outline-none placeholder:text-gray-600"
                                    />
                                </div>
                                {/* Sort */}
                                <button
                                    onClick={() => setSortAsc(!sortAsc)}
                                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#3a3a3a] hover:text-white"
                                    title={sortAsc ? 'Sort Z-A' : 'Sort A-Z'}
                                >
                                    <ArrowUpDown size={16} />
                                </button>
                                {/* Filter */}
                                <div className="relative" ref={filterRef}>
                                    <button
                                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                        className={`relative rounded-lg p-2 transition-colors hover:bg-[#3a3a3a] ${filterDifficulty ? 'text-[#ffc01e]' : 'text-gray-400 hover:text-white'}`}
                                        title="Filter by difficulty"
                                    >
                                        <Filter size={16} />
                                        {filterDifficulty && (
                                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#ff375f]" />
                                        )}
                                    </button>
                                    {showFilterDropdown && (
                                        <div className="absolute top-full right-0 z-10 mt-1 w-32 rounded-lg border border-[#444] bg-[#2a2a2a] py-1 shadow-xl">
                                            <button
                                                onClick={() => {
                                                    setFilterDifficulty(null)
                                                    setShowFilterDropdown(false)
                                                }}
                                                className={`w-full px-3 py-1.5 text-left text-xs hover:bg-[#3a3a3a] ${!filterDifficulty ? 'bg-[#3a3a3a] text-white' : 'text-gray-400'}`}
                                            >
                                                All
                                            </button>
                                            {Object.entries(DIFFICULTY_LABELS).map(
                                                ([key, { text, color }]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => {
                                                            setFilterDifficulty(key)
                                                            setShowFilterDropdown(false)
                                                        }}
                                                        className={`w-full px-3 py-1.5 text-left text-xs hover:bg-[#3a3a3a] ${filterDifficulty === key ? 'bg-[#3a3a3a]' : ''} ${color}`}
                                                    >
                                                        {text}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ─── Problem List ─── */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredProblems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-600">
                                    <Search size={28} className="mb-2 opacity-40" />
                                    <p className="text-sm">No problems found</p>
                                </div>
                            ) : (
                                filteredProblems.map((problem, index) => {
                                    const isSolved = solvedIds.includes(problem._id)
                                    const isActive = selectedProblemId === problem._id
                                    const diff =
                                        DIFFICULTY_LABELS[problem.difficulty] ||
                                        DIFFICULTY_LABELS.medium
                                    // Find original index for numbering
                                    const originalIndex = problems.findIndex(
                                        (p) => p._id === problem._id
                                    )

                                    return (
                                        <div
                                            key={problem._id}
                                            onClick={() => {
                                                onSelectProblem(problem, originalIndex)
                                                onClose()
                                            }}
                                            className={`group flex cursor-pointer items-center gap-3 border-l-2 px-5 py-3 transition-colors ${
                                                isActive
                                                    ? 'border-[#007acc] bg-[#333]'
                                                    : 'border-transparent hover:bg-[#2f2f2f]'
                                            } ${index % 2 === 0 ? '' : 'bg-[#2c2c2c]'}`}
                                        >
                                            {/* Solved checkmark */}
                                            <div className="w-5 flex-shrink-0">
                                                {isSolved && (
                                                    <CheckCircle2
                                                        size={16}
                                                        className="text-[#00b8a3]"
                                                    />
                                                )}
                                            </div>

                                            {/* Number + Title */}
                                            <div className="min-w-0 flex-1">
                                                <span
                                                    className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}
                                                >
                                                    {originalIndex + 1}. {problem.title}
                                                </span>
                                            </div>

                                            {/* Difficulty */}
                                            <span
                                                className={`flex-shrink-0 text-xs font-semibold ${diff.color}`}
                                            >
                                                {diff.text}
                                            </span>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
