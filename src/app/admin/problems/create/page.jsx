'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateProblemPage() {
    const router = useRouter()

    const [problem, setProblem] = useState({
        title: '',
        difficulty: 'easy',
        description: '',
        tags: '',
        timeLimit: 1,
        memoryLimit: 256,
    })

    const handleChange = (e) => {
        setProblem({
            ...problem,
            [e.target.name]: e.target.value,
        })
    }

    const createProblem = async (e) => {
        e.preventDefault()

        const res = await fetch('/api/problems', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...problem,
                tags: problem.tags.split(','),
            }),
        })

        const data = await res.json()

        if (data.success) {
            router.push('/admin/problems')
        }
    }

    return (
        <form onSubmit={createProblem} className="max-w-3xl space-y-4">
            <h1 className="text-2xl font-bold">Create Problem</h1>

            <input
                name="title"
                placeholder="Problem title"
                className="w-full rounded border p-2"
                onChange={handleChange}
            />

            <textarea
                name="description"
                placeholder="Description"
                className="w-full rounded border p-2"
                rows="6"
                onChange={handleChange}
            />

            <input
                name="tags"
                placeholder="array, dp, graph"
                className="w-full rounded border p-2"
                onChange={handleChange}
            />

            <select name="difficulty" className="rounded border p-2" onChange={handleChange}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
            </select>

            <button className="rounded bg-[#00bc7d] px-6 py-2 text-white">Create Problem</button>
        </form>
    )
}
