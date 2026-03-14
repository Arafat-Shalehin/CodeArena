import HistoryList from '@/features/interview/HistoryList'

export const metadata = {
    title: 'Interview History | CodeArena',
    description: 'Review your past AI interview sessions and performance.',
}

export default function InterviewHistoryPage() {
    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">
            <HistoryList />
        </main>
    )
}
