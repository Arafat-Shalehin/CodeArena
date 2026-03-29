import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, ArrowRight, User, Trophy, Code2 } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const DIFFICULTY_STYLES = {
    easy: 'text-success',
    medium: 'text-warning',
    hard: 'text-error',
}

/**
 * @component SearchBar
 * @description Universal typeahead search bar for problems, users, and contests.
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

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const search = useCallback((q) => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        if (!q.trim() || q.trim().length < 2) {
            setResults([])
            setIsSearching(false)
            return
        }
        setIsSearching(true)
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
                const json = await res.json()
                setResults(json.data || [])
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

    const navigate = (item) => {
        setIsOpen(false)
        setQuery('')
        setResults([])
        if (item.type === 'problem') router.push(`/problems/${item._id}`)
        else if (item.type === 'user') router.push(`/profile/${item._id}`)
        else if (item.type === 'contest') router.push(`/contests/${item._id}`)
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
        isOpen && (isSearching || results.length > 0 || (query.trim().length >= 2 && !isSearching))

    return (
        <div ref={containerRef} className="relative hidden max-w-[280px] flex-1 lg:block">
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
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search problems, users, contests..."
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={!!showDropdown}
                    aria-controls="search-dropdown"
                    aria-autocomplete="list"
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

            {showDropdown && (
                <div
                    id="search-dropdown"
                    className="border-border bg-bg-subtle absolute top-full right-0 left-0 z-50 mt-1.5 overflow-hidden rounded-xl border shadow-2xl"
                >
                    {results.length > 0 ? (
                        <ul role="listbox" className="py-1">
                            {results.map((item, idx) => (
                                <li
                                    key={`${item.type}-${item._id}`}
                                    role="option"
                                    aria-selected={idx === selectedIndex}
                                    onMouseDown={() => navigate(item)}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`group flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5 transition-colors ${
                                        idx === selectedIndex ? 'bg-bg-page' : 'hover:bg-bg-page'
                                    }`}
                                >
                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                        {/* Icon/Avatar based on type */}
                                        <div className="flex-shrink-0">
                                            {item.type === 'problem' && (
                                                <div className="bg-accent/10 flex size-8 items-center justify-center rounded-lg">
                                                    <Code2 size={16} className="text-accent" />
                                                </div>
                                            )}
                                            {item.type === 'user' && (
                                                <Avatar className="size-8">
                                                    <AvatarImage
                                                        src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${item.avatarSeed || item.name}`}
                                                    />
                                                    <AvatarFallback className="text-[10px] uppercase">
                                                        {(item.name || 'U').substring(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                            {item.type === 'contest' && (
                                                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10">
                                                    <Trophy size={16} className="text-amber-500" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-text-primary truncate text-sm font-medium">
                                                {item.title || item.name}
                                            </p>
                                            <div className="mt-0.5 flex items-center gap-2 text-[10px]">
                                                <span className="text-text-muted font-bold tracking-wider uppercase">
                                                    {item.type}
                                                </span>
                                                {item.type === 'problem' && (
                                                    <span
                                                        className={`font-bold capitalize ${DIFFICULTY_STYLES[item.difficulty]}`}
                                                    >
                                                        • {item.difficulty}
                                                    </span>
                                                )}
                                                {item.type === 'user' && item.stats?.globalRank && (
                                                    <span className="font-bold text-amber-500">
                                                        • Rank #{item.stats.globalRank}
                                                    </span>
                                                )}
                                                {item.type === 'contest' && (
                                                    <span className="text-accent font-bold capitalize">
                                                        • {item.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowRight className="text-text-muted group-hover:text-accent h-3.5 w-3.5 flex-shrink-0 transition-colors" />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        !isSearching &&
                        query.trim().length >= 2 && (
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
