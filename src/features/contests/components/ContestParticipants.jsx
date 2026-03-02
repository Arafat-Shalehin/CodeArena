import React from 'react'
import { Users } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

/**
 * @typedef {import('../data/sprint-45.data').Participant} Participant
 */

/**
 * @typedef {Object} ContestParticipantsProps
 * @property {Participant[]} participants - List of participants to display
 * @property {string} countLabel - Formatted string of total participants (e.g. "1,248 Joined")
 * @property {Function} [onViewAll] - Callback for "View All" button
 */

/**
 * ContestParticipants component displays a preview of contest participants
 * using avatars and a "view all" action.
 *
 * @param {ContestParticipantsProps} props
 * @returns {JSX.Element}
 */
export const ContestParticipants = ({ participants, countLabel, onViewAll }) => {
    return (
        <section className="border-border bg-bg-subtle rounded-2xl border p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="text-accent h-5 w-5" />
                    <h2 className="text-text-primary text-xl font-bold">Participants</h2>
                </div>
                <span className="bg-accent-light text-accent-text rounded-md px-2 py-1 text-xs font-bold">
                    {countLabel}
                </span>
            </div>

            <div className="mb-6 grid grid-cols-4 gap-3 md:gap-4">
                {participants.map((person) => (
                    <Avatar
                        key={person.id}
                        className="border-accent/20 h-12 w-12 border-2 transition-transform hover:scale-110"
                    >
                        <AvatarImage src={person.avatar} alt={person.name} />
                        <AvatarFallback className="bg-bg-muted text-text-muted text-xs font-bold">
                            {person.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                ))}
                <div className="border-border bg-bg-page text-text-muted flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed text-xs font-bold">
                    +1.2k
                </div>
            </div>

            <Button
                variant="outline"
                className="bg-bg-page text-text-secondary hover:bg-bg-muted hover:text-accent w-full font-bold"
                onClick={onViewAll}
            >
                View All Participants
            </Button>
        </section>
    )
}
