import React from 'react'
import dbConnect from '@/lib/mongodb'
import { getProblemById } from '@/services/problem.service'
import { TestCase } from '@/models/TestCase.models'
import ProblemSolverLayout from '@/features/problem-solve/components/ProblemSolverLayout'

export const metadata = {
    title: 'CodeArena - Solve Problem',
    description: 'Solve competitive programming problems on CodeArena.',
}

export default async function ProblemDetailPage({ params }) {
    const { id } = await params

    let initialProblem = null
    try {
        await dbConnect()
        const problem = await getProblemById(id)
        if (problem) {
            const testCaseCount = await TestCase.countDocuments({ problemId: id })
            const problemObj = problem.toObject ? problem.toObject() : problem
            // Stringify to handle ObjectIds and Dates safely for Client Component props
            initialProblem = JSON.parse(JSON.stringify({ ...problemObj, testCaseCount }))
        }
    } catch (error) {
        console.error('[ProblemDetailPage] Error fetching problem server-side:', error)
    }

    return <ProblemSolverLayout key={id} problemId={id} initialProblem={initialProblem} />
}
