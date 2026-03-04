import ContestDetailPage from '@/features/contests/components/ContestDetailPage'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export async function generateMetadata({ params }) {
    const { id } = await params
    return {
        title: `Contest Details | CodeArena`,
        description: `View contest details and register to compete.`,
    }
}

export default async function Page({ params }) {
    const { id } = await params
    return (
        <div className="bg-bg-page site-gradient flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                <ContestDetailPage contestId={id} />
            </main>
            <Footer />
        </div>
    )
}
