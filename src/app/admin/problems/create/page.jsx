'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import ProblemForm from '@/features/problems/components/ProblemForm'

export default function CreateProblemPage() {
    const router = useRouter()

    return (
        <div className="mx-auto max-w-4xl pb-10">
            <div className="mb-6 flex items-center justify-between">
                <Link
                    href="/admin/problems"
                    className="text-text-muted hover:text-accent flex items-center text-xs font-bold tracking-widest uppercase opacity-70 transition-colors hover:opacity-100"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back to Problems
                </Link>
            </div>

            <ProblemForm
                mode="create"
                onSubmit={() => {
                    router.push('/admin/problems')
                }}
            />
        </div>
    )
}
