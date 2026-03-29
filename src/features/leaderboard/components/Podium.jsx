import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'

export function Podium({ topThree }) {
    if (!topThree || topThree.length < 3) return null

    const [first, second, third] = topThree

    // Helper to render a podium spot
    const PodiumSpot = ({ user, position, delay }) => {
        const isFirst = position === 1
        const isSecond = position === 2

        let heightClass = 'h-48 md:h-64' // Default for 3rd
        if (isFirst) heightClass = 'h-64 md:h-80'
        if (isSecond) heightClass = 'h-56 md:h-72'

        let colorClass = 'from-amber-700/20 to-orange-900/20 border-amber-700/30 text-amber-700' // Bronze
        if (isFirst)
            colorClass =
                'from-yellow-400/20 to-yellow-600/20 border-yellow-400/50 text-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]' // Gold
        if (isSecond)
            colorClass = 'from-slate-300/20 to-slate-400/20 border-slate-300/50 text-slate-400' // Silver

        return (
            <div
                className={`flex flex-col items-center justify-end ${isFirst ? 'z-10 order-2 -mt-12' : isSecond ? 'order-1' : 'order-3'}`}
            >
                {/* Avatar Section */}
                <div className="group relative mb-4">
                    {/* Crown for #1 */}
                    {isFirst && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce text-4xl">
                            👑
                        </div>
                    )}

                    <div
                        className={`relative rounded-full bg-gradient-to-br p-1 ${user.color} ${isFirst ? 'p-1.5' : ''} transition-transform duration-300 hover:scale-105`}
                    >
                        <Avatar
                            className={`${isFirst ? 'h-24 w-24 md:h-32 md:w-32' : 'h-20 w-20 md:h-24 md:w-24'} border-4 border-white`}
                        >
                            <AvatarImage
                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.seed}`}
                                alt={user.user}
                            />
                            <AvatarFallback>
                                {user.user.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        {/* Rank Badge */}
                        <div className="bg-bg-page text-text-primary font-display border-border absolute -bottom-2 left-1/2 z-20 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 font-bold shadow-lg">
                            {position}
                        </div>
                    </div>
                </div>

                {/* User Info */}
                <div className="mb-4 text-center">
                    <div className="font-display text-text-primary max-w-[120px] truncate text-lg font-bold md:max-w-[160px] md:text-xl">
                        {user.user}
                    </div>
                    <div className="text-text-light text-xs font-bold tracking-widest uppercase">
                        {user.title}
                    </div>
                    <div className="text-accent mt-1 font-mono font-bold">{user.elo} ELO</div>
                </div>

                {/* Podium Block */}
                <div
                    className={`w-full ${heightClass} bg-gradient-to-b ${colorClass} flex flex-col items-center justify-start rounded-t-2xl border-x border-t py-4 backdrop-blur-sm`}
                >
                    <div className="font-display text-4xl font-black opacity-20 select-none">
                        {position}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto mb-20 flex min-h-[400px] max-w-4xl items-end justify-center gap-4 px-4 md:gap-8">
            {/* Rank 2 */}
            <PodiumSpot user={second} position={2} />

            {/* Rank 1 */}
            <PodiumSpot user={first} position={1} />

            {/* Rank 3 */}
            <PodiumSpot user={third} position={3} />
        </div>
    )
}
