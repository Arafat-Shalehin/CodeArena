import ReplayPlayer from '@/features/interview/ReplayPlayer'

export default async function ReplayPage({ params }) {
    const { id } = await params

    return (
        <main className="h-screen overflow-hidden bg-[#0a0a0a]">
            <ReplayPlayer sessionId={id} />
        </main>
    )
}
