'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminProblemsPage() {
    const [problems, setProblems] = useState([])

    useEffect(() => {
        fetchProblems()
    }, [])

    const fetchProblems = async () => {
        const res = await fetch('/api/problems')
        const data = await res.json()

        if (data.success) {
            setProblems(data.data)
        }
    }

    const deleteProblem = async (id) => {
        if (!confirm('Delete this problem?')) return

        await fetch(`/api/problems/${id}`, {
            method: 'DELETE',
        })

        fetchProblems()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Problems</h1>

                <Link
                    href="/admin/problems/create"
                    className="rounded-lg bg-black px-4 py-2 text-white"
                >
                    + Create Problem
                </Link>
            </div>

            <table className="w-full rounded-lg bg-white shadow">
                <thead>
                    <tr className="border-b text-left">
                        <th className="p-3">Title</th>
                        <th>Difficulty</th>
                        <th>Submissions</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {problems.map((p) => (
                        <tr key={p._id} className="border-b">
                            <td className="p-3">{p.title}</td>
                            <td>{p.difficulty}</td>
                            <td>{p.totalSubmissions}</td>

                            <td className="space-x-2">
                                <Link href={`/admin/problems/${p._id}`} className="text-blue-500">
                                    Edit
                                </Link>

                                <Link
                                    href={`/admin/problems/${p._id}/testcases`}
                                    className="text-green-500"
                                >
                                    Testcases
                                </Link>

                                <button
                                    onClick={() => deleteProblem(p._id)}
                                    className="text-red-500"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
