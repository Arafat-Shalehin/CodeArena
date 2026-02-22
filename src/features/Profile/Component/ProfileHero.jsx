export default function ProfileHero() {
  return (
    <div className="relative rounded-xl overflow-hidden bg-bg-subtle border border-border mb-8">
      {/* Banner */}
      <div className="h-40 w-full bg-gradient-to-r from-accent/20 via-accent/5 to-transparent relative">
        <div className="absolute top-4 right-6 text-text-primary/5 font-bold text-4xl select-none font-mono">
          CODEARENA
        </div>
      </div>

      <div className="px-8 pb-8 flex flex-col md:flex-row items-end gap-6 -mt-12 relative z-10">
        {/* USER PROFILE :// Avatar */}
        <div className="p-1 rounded-full bg-bg-page border-4 border-bg-page shadow-xl">
          <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-accent">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=rabiul"
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* User Info & Buttons */}
        <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-end w-full gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-text-primary">
                rabiul_codes
              </h1>
              {/* Rewards  */}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-light text-warning border border-warning/20">
                🏆 #342
              </span>
            </div>
            {/* User NAme */}
            <p className="text-text-secondary text-lg">Rabiul Islam</p>
          </div>
          {/* buttons  */}
          <div className="flex gap-3 w-full md:w-auto">
            <button className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-md transition-colors shadow-sm">
              Follow
            </button>
            <button className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-bg-subtle hover:bg-bg-muted text-text-primary text-sm font-semibold rounded-md border border-border transition-colors">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
