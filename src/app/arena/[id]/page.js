import ArenaPage from '@/features/contests/components/ArenaPage'

export const metadata = {
    title: 'Contest Arena | CodeArena',
    description: 'Live coding contest interface.',
}

export default async function Page({ params }) {
    const { id } = await params
    return <ArenaPage contestId={id} />
}
