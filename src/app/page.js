import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/features/home/components/Hero'
import FeaturesBentoGrid from '@/features/home/components/FeaturesBentoGrid'
import FeaturesHeader from '@/features/home/components/FeaturesHeader'
import { SmoothScroll } from '@/components/providers/SmoothScroll'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ui/error-boundary'

// Lazy-load sections below the fold for better initial paint performance
const HowItWorksSection = dynamic(() => import('@/features/home/components/HowItWorksSection'), {
    loading: () => <SectionSkeleton />,
})
const RecentProblemsSection = dynamic(
    () => import('@/features/home/components/RecentProblemsSection'),
    { loading: () => <SectionSkeleton /> }
)
const LeaderboardPreviewSection = dynamic(
    () => import('@/features/home/components/LeaderboardPreviewSection'),
    { loading: () => <SectionSkeleton /> }
)
const TrustedBySection = dynamic(() => import('@/features/home/components/TrustedBySection'), {
    loading: () => <SectionSkeleton />,
})
const SkillShiftSection = dynamic(() => import('@/features/home/components/SkillShiftSection'), {
    loading: () => <SectionSkeleton />,
})

// Simple skeleton loader for lazy-loaded sections
function SectionSkeleton() {
    return (
        <div className="bg-bg-subtle/40 mx-auto max-w-7xl animate-pulse px-4 py-16 md:py-24">
            <div className="bg-bg-subtle mx-auto h-8 w-48 rounded-lg" />
            <div className="bg-bg-subtle/60 mt-8 h-64 w-full rounded-xl" />
        </div>
    )
}

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
        <SmoothScroll>
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
                        <section className="bg-bg-page relative mx-auto max-w-7xl px-4 py-16 md:py-24">
                            <FeaturesHeader />
                            <FeaturesBentoGrid />
                        </section>
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
        </SmoothScroll>
    )
}
