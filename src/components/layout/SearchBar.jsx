'use client';

import { Search } from 'lucide-react';

/**
 * @component SearchBar
 * @description Desktop search input with keyboard shortcut hint (Ctrl+K).
 * Used in the Navbar for searching problems.
 *
 * @returns {JSX.Element} The rendered search bar.
 */
export default function SearchBar() {
    return (
        <div className="flex-1 max-w-md hidden lg:block">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors h-4 w-4" />
                <input
                    type="text"
                    placeholder="Search problems..."
                    className="w-full pl-10 pr-4 py-2 bg-bg-subtle border border-border rounded-xl text-sm focus:outline-none focus:bg-bg-page focus:border-accent/20 focus:ring-4 focus:ring-accent/5 transition-all placeholder:text-text-muted"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                    <span className="text-[10px] bg-bg-page border border-border rounded px-1.5 py-0.5 text-text-muted">
                        Ctrl
                    </span>
                    <span className="text-[10px] bg-bg-page border border-border rounded px-1.5 py-0.5 text-text-muted">
                        K
                    </span>
                </div>
            </div>
        </div>
    );
}
