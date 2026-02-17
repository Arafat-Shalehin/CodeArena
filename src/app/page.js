import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../features/home/components/Hero';
import FeaturesSection from '../features/home/components/FeaturesSection';
import HowItWorksSection from '../features/home/components/HowItWorksSection';
import RecentProblemsSection from '../features/home/components/RecentProblemsSection';
import LeaderboardPreviewSection from '../features/home/components/LeaderboardPreviewSection';

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
    <div className="min-h-screen flex flex-col font-sans text-text-main bg-background">
      <Navbar />

      <main className="flex-grow">
        <Hero />
        <FeaturesSection />
        <HowItWorksSection />
        <RecentProblemsSection />
        <LeaderboardPreviewSection />
      </main>

      <Footer />
    </div>
  );
}
