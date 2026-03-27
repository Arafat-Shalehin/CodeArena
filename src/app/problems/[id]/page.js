import React from 'react'
import ProblemSolverLayout from '@/features/problem-solve/components/ProblemSolverLayout'

export const metadata = {
    title: 'CodeArena - Solve Problem',
    description: 'Solve competitive programming problems on CodeArena.',
}

export default async function ProblemDetailPage({ params }) {
    const { id } = await params

    return <ProblemSolverLayout problemId={id} />
}
