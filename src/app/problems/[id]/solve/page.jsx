import React from 'react'

// Layout Wrappers
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// Feature Component
import ProblemSolverLayout from '@/features/problem-solve/components/ProblemSolverLayout'

export const metadata = {
    title: 'CodeArena - Problem Solver',
    description: 'Solve competitive programming problems on CodeArena.',
}

export default async function ProblemSolvePage({ params }) {
    const { id } = await params

    return (
        <div className="bg-bg-page flex h-screen flex-col overflow-hidden">
            <Navbar />
            <main className="flex flex-1 overflow-hidden">
                <ProblemSolverLayout problemId={id} />
            </main>
        </div>
    )
}
