'use client'

import React, { useState } from 'react'
import {
    HeroSection,
    BlogGrid,
    BlogFilters,
    Newsletter,
    BLOG_POSTS,
    BLOG_CATEGORIES,
    FEATURED_POST,
} from '@/features/blog'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Pagination } from '@/shared/components/ui/Pagination'

/**
 * BlogPage Root
 * Orchestrates the blog feature components.
 */
export default function BlogPage() {
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [currentPage, setCurrentPage] = useState(1)
    const POSTS_PER_PAGE = 9

    const filteredPosts =
        selectedCategory === 'All'
            ? BLOG_POSTS
            : BLOG_POSTS.filter((post) => post.tag === selectedCategory)

    // Pagination Logic
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
    const indexOfLastPost = currentPage * POSTS_PER_PAGE
    const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost)

    const handlePageChange = (page) => {
        setCurrentPage(page)
        window.scrollTo({ top: 400, behavior: 'smooth' }) // Scroll to filters area
    }

    const handleCategoryChange = (category) => {
        setSelectedCategory(category)
        setCurrentPage(1) // Reset to page 1 on filter change
    }

    return (
        <div className="bg-bg-page text-text-primary min-h-screen font-sans antialiased">
            <Navbar></Navbar>
            <main>
                {/* Featured Content Area */}
                <HeroSection post={FEATURED_POST} />

                {/* Filter & Interaction Hub */}
                <BlogFilters
                    categories={BLOG_CATEGORIES}
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleCategoryChange}
                />

                {/* Transmission Grid */}
                <section className="px-6 py-20 md:px-20 lg:px-32">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-12 flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                                Recent <span className="text-accent">Transmissions</span>
                            </h2>
                            <div className="from-border/50 mx-8 hidden h-px flex-1 bg-gradient-to-r to-transparent sm:block"></div>
                        </div>

                        {currentPosts.length > 0 ? (
                            <>
                                <BlogGrid posts={currentPosts} />
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        ) : (
                            <div className="border-border text-text-muted flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
                                <p>No transmissions found for this sector.</p>
                            </div>
                        )}

                        <div className="mt-16 flex justify-center">
                            <button className="border-accent/20 bg-accent-light text-accent-text hover:bg-accent rounded-md border px-8 py-3 text-xs font-bold tracking-widest uppercase transition-all hover:text-white">
                                Load Architecture Data
                            </button>
                        </div>
                    </div>
                </section>

                {/* Community Engagement */}
                <Newsletter />
            </main>
            <Footer></Footer>
        </div>
    )
}
