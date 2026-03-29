import HistoryList from '@/features/interview/HistoryList'
import { Sparkles, Calendar } from 'lucide-react'

export const metadata = {
    title: 'Interview History | CodeArena',
    description: 'Review your past AI interview sessions and performance.',
}

export default function InterviewHistoryPage() {
    return (
        <main className="bg-bg-page selection:bg-accent/30 min-h-screen pb-20">
            {/* Header */}
            <div className="relative overflow-hidden pt-20 pb-12">
                <div className="from-accent/5 pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b via-transparent to-transparent" />

                <div className="relative container mx-auto max-w-6xl px-4">
                    <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="border-accent/20 bg-accent/10 text-accent mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black tracking-widest uppercase">
                                <Calendar size={12} />
                                Learning Journey
                            </div>
                            <h1 className="text-text-primary text-4xl font-[1000] tracking-tight md:text-5xl">
                                Session{' '}
                                <span className="text-accent font-serif italic">History.</span>
                            </h1>
                            <p className="text-text-secondary mt-2 max-w-xl text-sm font-medium">
                                Track your progress, review detailed evaluations, and watch session
                                replays to improve your interview performance.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-4">
                <HistoryList />
            </div>
        </main>
    )
}
