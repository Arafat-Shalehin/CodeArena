import { ContestsPage } from '@/features/contests'
import Navbar from '@/components/layout/Navbar'

export const metadata = {
    title: 'Contests | CodeArena',
    description: 'Compete in coding contests and climb the leaderboard.',
}

export default function Page() {
    return (
        <div className="bg-bg-page site-gradient flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                <ContestsPage />
            </main>
        </div>
    )
}
