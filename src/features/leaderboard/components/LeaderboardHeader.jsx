// Components
import { Badge } from '@/components/ui/badge'

/**
 * @component LeaderboardHeader
 * @description Hero section for the leaderboard page.
 *
 * Features:
 * - Live rankings badge indicator
 * - Main title with accent styling
 * - Descriptive subtitle
 * - Design token-based styling
 *
 * @returns {JSX.Element} The rendered leaderboard header.
 */
export function LeaderboardHeader() {
    return (
        <div className="relative z-10 mx-auto mb-16 max-w-2xl text-center">
            {/* <Badge variant="outline" className="mb-4 bg-primary/5 hover:bg-primary/10 transition-colors border-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                <span className="mr-2">🏆</span> Live Rankings
            </Badge> */}

            <h1 className="font-display text-text-primary mb-6 text-4xl font-bold tracking-tight md:text-6xl">
                Global <span className="text-accent italic">Hall of Fame</span>
            </h1>

            <p className="text-text-muted mx-auto max-w-xl text-lg leading-relaxed md:text-xl">
                Recognizing the elite minds pushing the boundaries of competitive programming. Join
                the ranks of the world's best.
            </p>

            {/* Decorative background elements can be added here if needed */}
        </div>
    )
}
