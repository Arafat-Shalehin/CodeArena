'use client';

import { useState } from "react";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProblemsSidebar from '@/features/problems/components/ProblemsSidebar';
import ProblemsToolbar from '@/features/problems/components/ProblemsToolbar';
import ProblemsTable from '@/features/problems/components/ProblemsTable';
import { problems as initialProblems } from '@/features/problems/data/problems.data';

export default function ProblemsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("Difficulty");

    const filtered = initialProblems.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen flex flex-col bg-bg-page font-sans text-text-primary">
            <Navbar />

            <main className="flex-grow max-w-container mx-auto px-4 md:px-6 py-8 w-full">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-sm mb-8 text-text-muted">
                    <a href="/" className="hover:text-accent transition-colors duration-normal">Home</a>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                    <span className="text-text-primary font-medium">Problems</span>
                </nav>

                <div className="flex flex-col lg:flex-row gap-8">
                    <ProblemsSidebar
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />

                    <section className="flex-1 min-w-0 space-y-6">
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
