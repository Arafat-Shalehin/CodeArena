import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

export function Podium({ topThree }) {
    if (!topThree || topThree.length < 3) return null;

    const [first, second, third] = topThree;

    // Helper to render a podium spot
    const PodiumSpot = ({ user, position, delay }) => {
        const isFirst = position === 1;
        const isSecond = position === 2;

        let heightClass = "h-48 md:h-64"; // Default for 3rd
        if (isFirst) heightClass = "h-64 md:h-80";
        if (isSecond) heightClass = "h-56 md:h-72";

        let colorClass = "from-amber-700/20 to-orange-900/20 border-amber-700/30 text-amber-700"; // Bronze
        if (isFirst) colorClass = "from-yellow-400/20 to-yellow-600/20 border-yellow-400/50 text-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]"; // Gold
        if (isSecond) colorClass = "from-slate-300/20 to-slate-400/20 border-slate-300/50 text-slate-400"; // Silver

        return (
            <div className={`flex flex-col items-center justify-end ${isFirst ? 'order-2 -mt-12 z-10' : isSecond ? 'order-1' : 'order-3'}`}>
                {/* Avatar Section */}
                <div className="relative mb-4 group">
                    {/* Crown for #1 */}
                    {isFirst && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-4xl animate-bounce">
                            👑
                        </div>
                    )}

                    <div className={`relative p-1 rounded-full bg-gradient-to-br ${user.color} ${isFirst ? 'p-1.5' : ''} transition-transform duration-300 hover:scale-105`}>
                        <Avatar className={`${isFirst ? 'w-24 h-24 md:w-32 md:h-32' : 'w-20 h-20 md:w-24 md:h-24'} border-4 border-white`}>
                            <AvatarImage
                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.seed}`}
                                alt={user.user}
                            />
                            <AvatarFallback>{user.user.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>

                        {/* Rank Badge */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-black font-bold font-display rounded-full w-8 h-8 flex items-center justify-center border-2 border-zinc-100 shadow-lg z-20">
                            {position}
                        </div>
                    </div>
                </div>

                {/* User Info */}
                <div className="text-center mb-4">
                    <div className="font-display font-bold text-text-main text-lg md:text-xl truncate max-w-[120px] md:max-w-[160px]">
                        {user.user}
                    </div>
                    <div className="text-xs font-bold text-text-light uppercase tracking-widest">{user.title}</div>
                    <div className="mt-1 font-mono font-bold text-primary">{user.elo} ELO</div>
                </div>

                {/* Podium Block */}
                <div className={`w-full ${heightClass} bg-gradient-to-b ${colorClass} backdrop-blur-sm rounded-t-2xl border-x border-t flex flex-col items-center justify-start py-4`}>
                    <div className="text-4xl font-display font-black opacity-20 select-none">
                        {position}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex items-end justify-center gap-4 md:gap-8 mb-20 max-w-4xl mx-auto px-4 min-h-[400px]">
            {/* Rank 2 */}
            <PodiumSpot user={second} position={2} />

            {/* Rank 1 */}
            <PodiumSpot user={first} position={1} />

            {/* Rank 3 */}
            <PodiumSpot user={third} position={3} />
        </div>
    );
}
