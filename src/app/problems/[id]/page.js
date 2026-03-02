import React from 'react'
import Navbar from '@/components/layout/Navbar'
import ProblemSolverLayout from '@/features/problem-solve/components/ProblemSolverLayout'

export const metadata = {
    title: 'CodeArena - Solve Problem',
    description: 'Solve competitive programming problems on CodeArena.',
}

export default async function ProblemDetailPage({ params }) {
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
