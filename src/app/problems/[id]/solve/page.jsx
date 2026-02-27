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

export default function ProblemSolvePage() {
    return (
        <div className="bg-bg-page flex h-screen flex-col overflow-hidden">
            <Navbar />
            {/* 
              The layout container expands to fill remaining height.
              Inside it, the split-pane Resizable panel consumes everything.
            */}
            <main className="flex flex-1 overflow-hidden">
                <ProblemSolverLayout />
            </main>
        </div>
    )
}
