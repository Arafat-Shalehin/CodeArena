import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AboutHero from '@/features/about/components/AboutHero'
import AboutMission from '@/features/about/components/AboutMission'
import AboutFeatures from '@/features/about/components/AboutFeatures'
import AboutTeam from '@/features/about/components/AboutTeam'
import ErrorBoundary from '@/components/ui/error-boundary'

/**
 * AboutPage component (Main route).
 * orchestrates all the about-themed feature sections into a single cohesive page.
 * Includes global layout components like Navbar and Footer.
 *
 * @page
 * @returns {React.ReactElement} The full About page layout.
 */
export default function AboutPage() {
    return (
        <div className="text-text-primary bg-bg-page flex min-h-screen flex-col font-sans">
            <Navbar />

            <main className="flex-grow">
                <ErrorBoundary>
                    <AboutHero />
                </ErrorBoundary>

                <ErrorBoundary>
                    <AboutMission />
                </ErrorBoundary>

                <ErrorBoundary>
                    <AboutFeatures />
                </ErrorBoundary>

                <ErrorBoundary>
                    <AboutTeam />
                </ErrorBoundary>
            </main>

            <Footer />
        </div>
    )
}
