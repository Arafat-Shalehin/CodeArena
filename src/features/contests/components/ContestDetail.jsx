import React from 'react'
import { ContestHero } from './ContestHero'
import { ContestAbout } from './ContestAbout'
import { ContestPrizes } from './ContestPrizes'
import { ContestParticipants } from './ContestParticipants'
import { ContestPastSprints } from './ContestPastSprints'
import { CONTEST_DATA } from '../data/sprint-45.data'

/**
 * ContestDetail component is the main feature orchestrator for the contest landing/detail page.
 * It layouts the hero section, the main content area (About, Prizes), and the sidebar (Participants, Past Sprints).
 *
 * @returns {JSX.Element}
 */
const ContestDetail = () => {
    // In a real application, data fetching would happen here (e.g., via React Query)
    const data = CONTEST_DATA

    const handleRegister = () => {
        console.log('Registering for contest:', data.id)
    }

    const handleViewParticipants = () => {
        console.log('Viewing all participants for:', data.id)
    }

    return (
        <div className="bg-bg-page text-text-primary selection:bg-accent/20 min-h-screen font-sans">
            <main className="max-w-container mx-auto px-4 py-8 md:px-6 lg:py-12">
                {/* Hero Section */}
                <ContestHero
                    title={data.title}
                    description={data.description}
                    status={data.status}
                    startTime={data.startTime}
                    onRegister={handleRegister}
                />

                {/* Content Grid */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Main Content Column */}
                    <div className="space-y-8 lg:col-span-2">
                        <ContestAbout
                            description="Join our weekly competitive programming sprint! This contest is designed to test your ability to think quickly and implement efficient solutions under time pressure."
                            duration={data.duration}
                            problemsCount={data.problemsCount}
                            languages={data.languages}
                        />

                        <ContestPrizes prizes={data.prizes} />
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-8">
                        <ContestParticipants
                            participants={data.participants}
                            countLabel={data.participantsCount}
                            onViewAll={handleViewParticipants}
                        />

                        <ContestPastSprints sprints={data.pastSprints} />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default ContestDetail
