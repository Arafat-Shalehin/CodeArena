'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, ArrowRight } from 'lucide-react'

const DIFFICULTY_STYLES = {
    easy: 'text-[#2cbb5d]',
    medium: 'text-[#ffc01e]',
    hard: 'text-[#ff375f]',
}

// Accent badge color per difficulty using site semantic class names
const DIFFICULTY_BG = {
    easy: 'bg-[#2cbb5d]/10',
    medium: 'bg-[#ffc01e]/10',
    hard: 'bg-[#ff375f]/10',
}

/**
 * @component SearchBar
 * @description Inline typeahead search bar. Shows a dropdown of results directly below
 * the input as the user types. Press Ctrl+K to focus.
 */
export default function SearchBar() {
    const router = useRouter()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef(null)
    const containerRef = useRef(null)
    const debounceRef = useRef(null)

    // Ctrl+K / Cmd+K focuses the input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                inputRef.current?.focus()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Debounced search against /api/search
    const search = useCallback((q) => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        if (!q.trim()) {
            setResults([])
            setIsSearching(false)
            return
        }
        setIsSearching(true)
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&limit=6`)
                const json = await res.json()
                if (json.success) {
                    // Combine problems and users into a flat array for easier keyboard navigation
                    const combined = [
                        ...(json.data.problems || []).map((p) => ({ ...p, type: 'problem' })),
                        ...(json.data.users || []).map((u) => ({ ...u, type: 'user' })),
                    ]
                    setResults(combined)
                } else {
                    setResults([])
                }
            } catch {
                setResults([])
            } finally {
                setIsSearching(false)
            }
        }, 300)
    }, [])

    const handleChange = (e) => {
        const val = e.target.value
        setQuery(val)
        setSelectedIndex(0)
        setIsOpen(true)
        search(val)
    }

    /**
     * Navigates to the selected item's detail page.
     * @param {Object} item - The result item (problem or user).
     */
    const navigate = (item) => {
        setIsOpen(false)
        setQuery('')
        setResults([])
        if (item.type === 'problem') {
            router.push(`/problems/${item._id}`)
        } else {
            router.push(`/profile/${item._id}`)
        }
    }

    const handleKeyDown = (e) => {
        if (!isOpen) return
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex((i) => Math.max(i - 1, 0))
        } else if (e.key === 'Enter') {
            if (results[selectedIndex]) navigate(results[selectedIndex])
        } else if (e.key === 'Escape') {
            setIsOpen(false)
        }
    }

    const showDropdown =
        isOpen && (isSearching || results.length > 0 || (query.trim() && !isSearching))

    return (
        <div ref={containerRef} className="relative hidden max-w-md flex-1 lg:block">
            {/* Input */}
            <div className="group relative">
                {isSearching ? (
                    <Loader2 className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 animate-spin" />
                ) : (
                    <Search className="text-text-muted group-focus-within:text-accent absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transition-colors" />
                )}
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => query && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search problems or users..."
                    autoComplete="off"
                    aria-label="Search problems or users (Ctrl+K)"
                    className="bg-bg-subtle border-border focus:bg-bg-page focus:border-accent/20 focus:ring-accent/5 placeholder:text-text-muted w-full rounded-xl border py-2 pr-20 pl-10 text-sm transition-all focus:ring-4 focus:outline-none"
                />
                {!query && (
                    <div className="pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 gap-1">
                        <span className="bg-bg-page border-border text-text-muted rounded border px-1.5 py-0.5 text-[10px]">
                            Ctrl
                        </span>
                        <span className="bg-bg-page border-border text-text-muted rounded border px-1.5 py-0.5 text-[10px]">
                            K
                        </span>
                    </div>
                )}
            </div>

            {/* Inline Dropdown */}
            {showDropdown && (
                <div className="border-border bg-bg-subtle absolute top-full right-0 left-0 z-50 mt-1.5 max-h-[80vh] overflow-y-auto rounded-xl border shadow-2xl">
                    {results.length > 0 ? (
                        <div className="py-1">
                            {results.map((item, idx) => {
                                const isFirstOfType =
                                    idx === 0 || results[idx - 1].type !== item.type
                                return (
                                    <div key={item._id}>
                                        {isFirstOfType && (
                                            <div className="text-text-muted bg-bg-muted/30 px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase">
                                                {item.type === 'problem' ? 'Problems' : 'Users'}
                                            </div>
                                        )}
                                        <div
                                            role="option"
                                            aria-selected={idx === selectedIndex}
                                            onMouseDown={() => navigate(item)}
                                            onMouseEnter={() => setSelectedIndex(idx)}
                                            className={`group flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5 transition-colors ${
                                                idx === selectedIndex
                                                    ? 'bg-bg-page'
                                                    : 'hover:bg-bg-page'
                                            }`}
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                                {item.type === 'user' && (
                                                    <div className="bg-accent/10 border-accent/20 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border">
                                                        <img
                                                            src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${item.avatarSeed || item.name}`}
                                                            alt={item.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-text-primary truncate text-sm font-medium">
                                                        {item.type === 'problem'
                                                            ? item.title
                                                            : item.name}
                                                    </p>
                                                    {item.type === 'problem' && (
                                                        <div className="mt-0.5 flex items-center gap-2 text-[11px]">
                                                            <span
                                                                className={`font-semibold capitalize ${DIFFICULTY_STYLES[item.difficulty] || 'text-text-muted'}`}
                                                            >
                                                                {item.difficulty}
                                                            </span>
                                                            {item.tags?.slice(0, 2).map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="bg-bg-muted text-text-muted rounded px-1.5 py-0.5"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {item.type === 'user' && (
                                                        <p className="text-text-muted text-[11px]">
                                                            User Profile
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <ArrowRight className="text-text-muted group-hover:text-accent h-3.5 w-3.5 flex-shrink-0 transition-colors" />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        !isSearching &&
                        query.trim() && (
                            <p className="text-text-muted px-4 py-4 text-center text-sm">
                                No results found for &ldquo;{query}&rdquo;
                            </p>
                        )
                    )}
                </div>
            )}
        </div>
    )
}
