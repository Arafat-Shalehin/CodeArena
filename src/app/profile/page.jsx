import Achievements from "@/features/Profile/Component/achievement";
import ContestPerformance from "@/features/Profile/Component/ContestPerformance";
import ProblemStats from "@/features/Profile/Component/ProblemStats";
import ProfileHero from "@/features/Profile/Component/ProfileHero";
import RecentSubmissions from "@/features/Profile/Component/RecentSubmissions";
import StatsGrid from "@/features/Profile/Component/StatsGrid";
import { Dot } from "lucide-react";

export default function ProfilePage() {
  const languages = [
    {
      language: "javascript",
      improve_parcentage: 60,
    },
    {
      language: "python",
      improve_parcentage: 15,
    },
    {
      language: "java",
      improve_parcentage: 5,
    },
    {
      language: "cotlin",
      improve_parcentage: 20,
    },
  ];
  const biggerPercentage = [...languages].sort(
    (a, b) => b.improve_parcentage - a.improve_parcentage,
  );
  const getColor = (index) => {
    if (index == 0) return "text-green-600";
    if (index == 1) return "text-yellow-600";
    if (index == 2) return "text-red-600";
    return " ";
  };
  return (
    <div className="bg-bg-page min-h-screen">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Hero & Status cards */}
        <ProfileHero />
        <StatsGrid />

        {/* 60/40 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Left Side (60%) */}
          <div className="lg:col-span-6 space-y-8">
            {/* Submition activity Section */}
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
                <div className="p-4  hover:bg-bg-muted/50 transition-colors">
                  <RecentSubmissions></RecentSubmissions>
                </div>
              </div>
            </section>
          </div>

          {/* Right Side (40%) */}
          <div className="lg:col-span-4 space-y-8">
            <ProblemStats></ProblemStats>
            {/* Languages */}
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
                <div className="grid grid-cols-2  text-xs gap-5 font-medium">
                  {biggerPercentage.map((language, index) => (
                    <div className="flex justify-between">
                      <span className="text-left text-text-secondary flex items-center ">
                        <Dot className={`${getColor(index)}`} size={30}></Dot>
                        {language.language}
                      </span>
                      <span className="text-left text-text-muted">
                        {language.improve_parcentage} %
                      </span>
                    </div>
                  ))}
                </div>
                {/* Add more as needed */}
              </div>
            </section>
            <ContestPerformance></ContestPerformance>
            <Achievements></Achievements>
          </div>
        </div>
      </main>
    </div>
  );
}
