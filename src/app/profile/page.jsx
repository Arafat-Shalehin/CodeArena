// src/app/profile/page.jsx
import ProfileHero from "@/features/Profile/Component/ProfileHero";
import RecentSubmissions from "@/features/Profile/Component/RecentSubmissions";
import StatsGrid from "@/features/Profile/Component/StatsGrid";

export default function ProfilePage() {
  return (
    <div className="bg-bg-page min-h-screen">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Hero & Stats */}
        <ProfileHero />
        <StatsGrid />

        {/* 60/40 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Left Side (60%) */}
          <div className="lg:col-span-6 space-y-8">
            {/* Heatmap Section */}
            <section className="bg-bg-subtle border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-text-primary mb-6">
                Submission Activity
              </h3>
              <div className="flex flex-wrap gap-1">
                {/* Mocking heatmap cells */}
                {[...Array(50)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-sm bg-accent opacity-20 hover:opacity-100 transition-opacity"
                  />
                ))}
              </div>
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
                {/* Single Row Item */}
                <div className="p-4 flex justify-between items-center hover:bg-bg-muted/50 transition-colors">
                  <div className="flex gap-4 items-center">
                    <span className="text-success text-xl">●</span>
                    <div>
                      <p className="text-sm font-semibold text-text-primary font-mono">
                        Two Sum
                      </p>
                      <p className="text-xs text-text-muted">
                        2 hours ago • C++
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-success-light text-success">
                    Accepted
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Side (40%) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Language Breakdown */}
            <section className="bg-bg-subtle border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Languages
              </h3>
              <div className="h-2 w-full flex rounded-full overflow-hidden mb-4 bg-bg-muted">
                <div className="bg-accent" style={{ width: "60%" }}></div>
                <div className="bg-warning" style={{ width: "25%" }}></div>
                <div className="bg-info" style={{ width: "15%" }}></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-text-secondary">C++</span>
                  <span className="text-text-primary">60%</span>
                </div>
                {/* Add more as needed */}
              </div>
              <RecentSubmissions></RecentSubmissions>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
