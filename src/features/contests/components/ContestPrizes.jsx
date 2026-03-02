import React from 'react'
import { Trophy, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * @typedef {import('../data/sprint-45.data').Prize} Prize
 */

/**
 * @typedef {Object} PrizeRowProps
 * @property {Prize} prize - The prize details
 */

/**
 * Reusable PrizeRow component for the Prizes section.
 *
 * @param {PrizeRowProps} props
 * @returns {JSX.Element}
 */
const PrizeRow = ({ prize }) => (
    <div className="group hover:border-accent/10 hover:bg-bg-page flex items-center justify-between rounded-xl border border-transparent p-4 transition-all hover:shadow-sm">
        <div className="flex items-center gap-4">
            <div
                className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full',
                    prize.colorClass,
                    prize.iconColor
                )}
            >
                <Award className="h-6 w-6" />
            </div>
            <div>
                <h4 className="text-text-primary font-bold">{prize.title}</h4>
                <p className="text-text-secondary text-sm">{prize.reward}</p>
            </div>
        </div>
        <span className="text-accent text-lg font-black">{prize.rank}</span>
    </div>
)

/**
 * @typedef {Object} ContestPrizesProps
 * @property {Prize[]} prizes - List of prizes for the contest
 */

/**
 * ContestPrizes component displays the rewards and ranking tiers for the contest.
 *
 * @param {ContestPrizesProps} props
 * @returns {JSX.Element}
 */
export const ContestPrizes = ({ prizes }) => {
    return (
        <section className="border-border bg-bg-subtle rounded-2xl border p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
                <div className="bg-accent-light text-accent-text flex h-10 w-10 items-center justify-center rounded-xl">
                    <Trophy className="h-6 w-6" />
                </div>
                <h2 className="text-text-primary text-2xl font-bold">Prizes & Rewards</h2>
            </div>

            <div className="space-y-4">
                {prizes.map((prize) => (
                    <PrizeRow key={prize.id} prize={prize} />
                ))}
            </div>
        </section>
    )
}
