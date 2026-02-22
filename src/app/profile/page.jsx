'use client';

import { useRouter } from 'next/navigation';

// Shared Layout
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Dot, Loader2 } from 'lucide-react';

// Profile Components
import ProfileHero from '@/features/profile/components/ProfileHero';
import StatsGrid from '@/features/profile/components/StatsGrid';
import RecentSubmissions from '@/features/profile/components/RecentSubmissions';
import ProblemStats from '@/features/profile/components/ProblemStats';
import ContestPerformance from '@/features/profile/components/ContestPerformance';
import Achievements from '@/features/profile/components/Achievements';

// Auth
import { useAuth } from '@/context/AuthContext';

// Data
import { getLanguageStats } from '@/features/profile/data/languages.data';

/**
 * @component ProfilePage
 * @description The main user profile page displaying user stats, submission
 * activity, recent submissions, problem stats, languages, contest performance,
 * and achievements in a responsive 60/40 grid layout.
 *
 * @returns {JSX.Element} The rendered profile page.
 */

/** Design-token-based color mapping for language ranking */
const LANGUAGE_COLORS = ['text-success', 'text-warning', 'text-error', 'text-info'];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Loading state while Firebase resolves
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-page">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </main>
        <Footer />
      </div>
    );
  }

  // Redirect unauthenticated users to login
  if (!user) {
    router.push('/login');
    return null;
  }
  const sortedLanguages = getLanguageStats(user.stats);

  return (
    <div className="min-h-screen flex flex-col bg-bg-page">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 md:px-6 py-8 w-full">
        {/* Hero & Stats Cards */}
        <ProfileHero />
        <StatsGrid />

        {/* 60/40 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Left Side (60%) — Submission Activity + Recent Submissions */}
          <div className="lg:col-span-6 space-y-8 order-2 lg:order-1">
            {/* Submission Activity Section */}
            <section className="bg-bg-subtle border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-text-primary mb-6">
                Submission Activity
              </h3>
              {user.stats?.submissionHistory && user.stats.submissionHistory.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {user.stats.submissionHistory.map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-sm bg-accent opacity-20 hover:opacity-100 transition-opacity"
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-border rounded-lg">
                  <p className="text-sm text-text-muted">No recent activity</p>
                </div>
              )}
            </section>

            {/* Recent Submissions */}
            <section className="bg-bg-subtle border border-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h3 className="text-xl font-semibold text-text-primary">
                  Recent Submissions
                </h3>
                <button className="text-sm font-semibold text-accent hover:text-accent-hover">
                  View all
                </button>
              </div>
              <div className="divide-y divide-border">
                <div className="hover:bg-bg-muted/50 transition-colors">
                  <RecentSubmissions submissions={user.stats?.recentSubmissions || []} />
                </div>
              </div>
            </section>
          </div>

          {/* Right Side (40%) — Stats-heavy panels first on mobile */}
          <div className="lg:col-span-4 space-y-8 order-1 lg:order-2">
            <ProblemStats />

            {/* Languages */}
            {sortedLanguages.length > 0 && (
              <section className="bg-bg-subtle border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  Languages
                </h3>
                <div className="h-2 w-full flex rounded-full overflow-hidden mb-4 bg-bg-muted">
                  {sortedLanguages.map((language, index) => (
                    <div
                      key={language.language}
                      className={index === 0 ? "bg-accent" : index === 1 ? "bg-warning" : index === 2 ? "bg-info" : "bg-success"}
                      style={{ width: `${language.percentage}%` }}
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 text-xs gap-5 font-medium">
                    {sortedLanguages.map((language, index) => (
                      <div key={language.language} className="flex justify-between">
                        <span className="text-left text-text-secondary flex items-center">
                          <Dot className={LANGUAGE_COLORS[index] || 'text-text-muted'} size={30} />
                          {language.language}
                        </span>
                        <span className="text-left text-text-muted">
                          {language.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            <ContestPerformance performance={user.stats?.contestPerformance} />
            <Achievements achievements={user.stats?.achievements} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
