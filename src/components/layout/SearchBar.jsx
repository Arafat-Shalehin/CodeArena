'use client'

import { Search } from 'lucide-react'

/**
 * @component SearchBar
 * @description Desktop search input with keyboard shortcut hint (Ctrl+K).
 * Used in the Navbar for searching problems.
 *
 * @returns {JSX.Element} The rendered search bar.
 */
export default function SearchBar() {
    return (
        <div className="hidden max-w-md flex-1 lg:block">
            <div className="group relative">
                <Search className="text-text-muted group-focus-within:text-accent absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transition-colors" />
                <input
                    type="text"
                    placeholder="Search problems..."
                    className="bg-bg-subtle border-border focus:bg-bg-page focus:border-accent/20 focus:ring-accent/5 placeholder:text-text-muted w-full rounded-xl border py-2 pr-4 pl-10 text-sm transition-all focus:ring-4 focus:outline-none"
                />
                <div className="absolute top-1/2 right-3 flex -translate-y-1/2 gap-1">
                    <span className="bg-bg-page border-border text-text-muted rounded border px-1.5 py-0.5 text-[10px]">
                        Ctrl
                    </span>
                    <span className="bg-bg-page border-border text-text-muted rounded border px-1.5 py-0.5 text-[10px]">
                        K
                    </span>
                </div>
            </div>
        </div>
    )
}
