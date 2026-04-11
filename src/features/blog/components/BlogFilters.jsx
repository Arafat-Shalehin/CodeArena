import React from 'react'
import { Search, Edit3 } from 'lucide-react'

/**
 * BlogFilters Component
 * Filter buttons and search input.
 * Following Design Token System patterns.
 */
const BlogFilters = ({ categories, selectedCategory, onSelectCategory }) => {
    return (
        <section className="bg-bg-subtle px-6 py-8 md:px-20 lg:px-32">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 xl:flex-row">
                {/* Category Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => onSelectCategory(category)}
                            className={`duration-normal focus:ring-accent rounded-md px-6 py-2 text-sm font-semibold transition-colors focus:ring-2 focus:outline-none ${
                                selectedCategory === category
                                    ? 'bg-accent text-white'
                                    : 'border-border bg-bg-page hover:bg-bg-muted text-text-secondary border'
                            }`}
                        >
                            {category}
                        </button>
                    ))}

                    <button className="bg-accent duration-normal hover:bg-accent-hover focus:ring-accent inline-flex items-center justify-center gap-2 rounded-md px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors focus:ring-2 focus:outline-none">
                        <Edit3 className="h-4 w-4" />
                        Write Blog
                    </button>
                </div>

                {/* Search Input */}
                <div className="group relative w-full xl:w-80">
                    <Search className="text-text-muted group-focus-within:text-accent absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search the archives..."
                        className="border-border bg-bg-page text-text-primary placeholder:text-text-muted duration-normal focus:ring-accent w-full rounded-md border py-2.5 pr-4 pl-10 text-sm transition-colors focus:border-transparent focus:ring-2 focus:outline-none"
                    />
                </div>
            </div>
        </section>
    )
}

export default BlogFilters
