import React from 'react'
import { Info, Clock, Layout, Globe } from 'lucide-react'

/**
 * @typedef {Object} StatCardProps
 * @property {React.ReactNode} icon - Lucide icon component
 * @property {string} title - Main statistic title
 * @property {string} subtitle - Statistic description
 */

/**
 * Reusable StatCard component for the About section.
 *
 * @param {StatCardProps} props
 * @returns {JSX.Element}
 */
const StatCard = ({ icon, title, subtitle }) => (
    <div className="border-border bg-bg-page hover:bg-bg-subtle flex flex-col items-start rounded-xl border p-5 shadow-sm transition-all lg:p-6">
        <div className="bg-accent-light text-accent-text mb-4 flex h-10 w-10 items-center justify-center rounded-lg">
            {icon}
        </div>
        <h4 className="text-text-primary mb-1 text-lg font-bold">{title}</h4>
        <p className="text-text-secondary text-sm">{subtitle}</p>
    </div>
)

/**
 * @typedef {Object} ContestAboutProps
 * @property {string} description - General description of the contest
 * @property {string} duration - The total time for the contest
 * @property {string} problemsCount - Number of problems in the contest
 * @property {string} languages - Available programming languages
 */

/**
 * ContestAbout component displays informational stats about the contest
 * such as duration, number of problems, and languages.
 *
 * @param {ContestAboutProps} props
 * @returns {JSX.Element}
 */
export const ContestAbout = ({ description, duration, problemsCount, languages }) => {
    return (
        <section className="border-border bg-bg-subtle rounded-2xl border p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
                <div className="bg-accent-light text-accent-text flex h-10 w-10 items-center justify-center rounded-xl">
                    <Info className="h-6 w-6" />
                </div>
                <h2 className="text-text-primary text-2xl font-bold">About the Contest</h2>
            </div>

            <p className="text-text-secondary mb-8 text-lg leading-relaxed">{description}</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                    icon={<Clock className="h-5 w-5" />}
                    title={duration}
                    subtitle="Contest Duration"
                />
                <StatCard
                    icon={<Layout className="h-5 w-5" />}
                    title={`${problemsCount} Problems`}
                    subtitle="Easy, Med, Hard"
                />
                <StatCard
                    icon={<Globe className="h-5 w-5" />}
                    title={languages}
                    subtitle="C++, Python, Java & more"
                />
            </div>
        </section>
    )
}
