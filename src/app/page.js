import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/features/home/components/Hero'
import FeaturesSection from '@/features/home/components/FeaturesSection'
import HowItWorksSection from '@/features/home/components/HowItWorksSection'
import RecentProblemsSection from '@/features/home/components/RecentProblemsSection'
import LeaderboardPreviewSection from '@/features/home/components/LeaderboardPreviewSection'
import TrustedBySection from '@/features/home/components/TrustedBySection'
import SkillShiftSection from '@/features/home/components/SkillShiftSection'

import ErrorBoundary from '@/components/ui/error-boundary'

/**
 * Home Page
 *
 * The main landing page for CodeArena.
 * composed of multiple feature-specific sections for better maintainability.
 *
 * Sections:
 * - Hero: Branding and main CTA
 * - Features: Bento grid of key differentiators
 * - HowItWorks: Step-by-step user journey
 * - RecentProblems: Curated list of coding challenges
 * - LeaderboardPreview: Snapshot of top users
 */
export default function Home() {
    return (
        <div className="text-text-primary bg-bg-page site-gradient flex min-h-screen flex-col font-sans">
            <Navbar />

            <main className="flex-grow">
                <ErrorBoundary>
                    <Hero />
                </ErrorBoundary>

                <ErrorBoundary>
                    <TrustedBySection />
                </ErrorBoundary>

                <ErrorBoundary>
                    <SkillShiftSection />
                </ErrorBoundary>

                <ErrorBoundary>
                    <FeaturesSection />
                </ErrorBoundary>

                <ErrorBoundary>
                    <HowItWorksSection />
                </ErrorBoundary>

                <ErrorBoundary>
                    <RecentProblemsSection />
                </ErrorBoundary>

                <ErrorBoundary>
                    <LeaderboardPreviewSection />
                </ErrorBoundary>
            </main>

            <Footer />
        </div>
    )
}
