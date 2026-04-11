'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ChevronLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Swal from 'sweetalert2'
import ProblemForm from '@/features/problems/components/ProblemForm'

export default function EditProblemPage() {
    const router = useRouter()
    const params = useParams()
    const [problemData, setProblemData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const res = await fetch(`/api/problems/${params.id}`)
                const result = await res.json()

                if (result.success) {
                    setProblemData(result.data)
                } else {
                    Swal.fire('Error', 'Problem not found', 'error')
                    router.push('/admin/problems')
                }
            } catch (error) {
                console.error('Fetch error:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProblem()
    }, [params.id, router])

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <div className="bg-accent/10 flex h-20 w-20 items-center justify-center rounded-2xl">
                    <Loader2 className="text-accent h-10 w-10 animate-spin" />
                </div>
                <p className="text-text-muted text-xs font-medium tracking-wide opacity-70">
                    Retrieving problem configuration...
                </p>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-4xl px-4 pb-10">
            <div className="mb-6">
                <Link
                    href="/admin/problems"
                    className="text-text-muted hover:text-accent flex items-center text-sm font-medium opacity-75 transition-colors hover:opacity-100"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back to Problems
                </Link>
            </div>

            <ProblemForm
                mode="edit"
                defaultData={problemData}
                onSubmit={() => {
                    router.push('/admin/problems')
                }}
            />
        </div>
    )
}
