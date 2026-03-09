import { useRouter } from 'next/navigation'
import { Users } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import React from 'react'

/**
 * @typedef {import('../data/sprint-45.data').Participant} Participant
 */

/**
 * @typedef {Object} ContestParticipantsProps
 * @property {Participant[]} participants - List of participants to display
 * @property {string} countLabel - Formatted string of total participants (e.g. "1,248 Joined")
 * @property {string} [contestId] - The ID of the contest for navigation
 * @property {Function} [onViewAll] - Callback for "View All" button
 */

/**
 * ContestParticipants component displays a preview of contest participants
 * using avatars and a "view all" action.
 *
 * @param {ContestParticipantsProps} props
 * @returns {JSX.Element}
 */
export const ContestParticipants = ({ participants, countLabel, onViewAll, contestId }) => {
    const router = useRouter()

    const handleViewAll = () => {
        if (onViewAll) {
            onViewAll()
        } else if (contestId) {
            router.push(`/contests/${contestId}/participants`)
        }
    }

    return (
        <section className="border-border bg-bg-subtle rounded-2xl border p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="text-accent h-5 w-5" />
                    <h2 className="text-text-primary text-xl font-bold">Participants</h2>
                </div>
                <span className="bg-accent/10 border-accent/20 text-accent rounded-md border px-2 py-1 text-[10px] font-black tracking-widest uppercase">
                    {countLabel}
                </span>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
                {participants.length > 0 ? (
                    participants.map((person) => (
                        <Avatar
                            key={person.id}
                            className="border-accent/10 h-10 w-10 border-2 transition-transform hover:scale-110"
                        >
                            <AvatarImage src={person.avatar} alt={person.name} />
                            <AvatarFallback className="bg-bg-muted text-text-muted text-[10px] font-black uppercase">
                                {person.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                    ))
                ) : (
                    <div className="text-text-muted text-[10px] font-bold tracking-widest uppercase">
                        Roster being updated...
                    </div>
                )}
            </div>

            <Button
                variant="outline"
                className="border-border text-text-secondary hover:bg-bg-muted hover:text-accent h-10 w-full bg-white text-[10px] font-black tracking-widest uppercase shadow-sm transition-all"
                onClick={handleViewAll}
            >
                View All Participants
            </Button>
        </section>
    )
}
