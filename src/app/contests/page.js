import React from 'react';
import { Clock, Users, Trophy, Zap, Calendar, Filter as FilterIcon, ArrowRight } from "lucide-react";

export default function Contests() {
  return (
    <div className="min-h-screen bg-background text-text-main p-6 md:p-10 text-rendering-optimize">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold font-display mb-2">Coding Contests</h1>
            <p className="text-text-muted">Compete with programmers worldwide and climb the leaderboard.</p>
          </div>
          <div className="flex items-center gap-2 bg-surface p-1.5 rounded-2xl border border-border-base">
            <button className="px-5 py-2 rounded-xl text-sm font-medium text-text-muted hover:text-text-main transition-all">Live</button>
            <button className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white shadow-lg shadow-primary/20">Upcoming</button>
            <button className="px-5 py-2 rounded-xl text-sm font-medium text-text-muted hover:text-text-main transition-all">Past Contests</button>
          </div>
        </div>

         <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 space-y-6 bg-surface p-6 rounded-3xl border border-border-base h-fit">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-light flex items-center gap-2">
              <FilterIcon size={14} className="text-primary" /> Filters
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-text-muted uppercase">Difficulty</p>
                <div className="space-y-2">
                  {['Easy', 'Medium', 'Hard'].map((lvl) => (
                    <label key={lvl} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
                      <span className="text-sm text-text-muted group-hover:text-text-main">{lvl}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-10">
            
            {/* Live Card - Using Hero Gradient from CSS */}
            <div className="relative overflow-hidden rounded-[40px] bg-primary p-8 md:p-12 shadow-2xl hero-gradient text-white">
              <div className="relative z-10 space-y-6">
                <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest border border-white/20">
                  ● Live Now
                </span>
                <h2 className="text-4xl md:text-5xl font-black font-display leading-none tracking-tighter">
                  Weekend Algorithm <br /> Sprint #12
                </h2>
                <div className="flex flex-wrap gap-6 text-white/90 font-mono text-sm">
                  <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-xl border border-white/10">
                    <Clock size={18} /> 01:45:22 remaining
                  </div>
                  <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-xl border border-white/10">
                    <Users size={18} /> 1,432 participants
                  </div>
                </div>
                <button className="bg-white text-primary px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-wider hover:scale-105 transition-all shadow-xl">
                  Enter Contest
                </button>
              </div>
              <Trophy className="absolute -right-10 -bottom-10 text-white/10 w-64 h-64 rotate-12" />
            </div>

            {/* Upcoming Challenges List */}
            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">Upcoming Challenges</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="group bg-surface border border-border-base p-8 rounded-[40px] hover:border-primary transition-all shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                       <span className="text-[10px] font-black text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 uppercase tracking-widest">Registering</span>
                       <Trophy size={20} className="text-text-light group-hover:text-primary transition-colors" />
                    </div>
                    <h4 className="text-2xl font-bold font-display mb-4">Weekly Challenge #{44 + i}</h4>
                    <div className="space-y-3 text-sm text-text-muted mb-8 font-sans">
                      <p className="flex items-center gap-3"><Calendar size={16} className="text-primary" /> Tomorrow, 10:00 AM</p>
                      <p className="flex items-center gap-3"><Clock size={16} className="text-primary" /> 2 hrs • 5 Problems</p>
                    </div>
                    <button className="w-full py-4 rounded-2xl bg-background border border-border-base group-hover:bg-primary group-hover:text-white group-hover:border-transparent text-text-main font-bold transition-all flex items-center justify-center gap-2">
                      Register Now <ArrowRight size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}