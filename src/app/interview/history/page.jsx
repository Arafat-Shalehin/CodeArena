import HistoryList from '@/features/interview/HistoryList'

export const metadata = {
    title: 'Interview History | CodeArena',
    description: 'Review your past AI interview sessions and performance.',
}

export default function InterviewHistoryPage() {
    return (
        <main className="bg-bg-page text-text-primary min-h-screen">
            <HistoryList />
        </main>
    )
}
