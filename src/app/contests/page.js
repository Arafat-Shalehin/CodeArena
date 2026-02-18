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

        
      </div>
    </div>
  );
}