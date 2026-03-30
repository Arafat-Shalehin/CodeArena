import ReplayPlayer from '@/features/interview/ReplayPlayer'

export default async function ReplayPage({ params }) {
    const { id } = await params

    return (
        <main className="bg-bg-page h-screen overflow-hidden">
            <ReplayPlayer sessionId={id} />
        </main>
    )
}
