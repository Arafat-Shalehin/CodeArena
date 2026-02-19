

// Components
import { Badge } from '@/components/ui/badge';

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
        <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
            {/* <Badge variant="outline" className="mb-4 bg-primary/5 hover:bg-primary/10 transition-colors border-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                <span className="mr-2">🏆</span> Live Rankings
            </Badge> */}

            <h1 className="text-4xl md:text-6xl font-display font-bold text-text-main mb-6 tracking-tight">
                Global <span className="text-primary italic">Hall of Fame</span>
            </h1>

            <p className="text-text-muted text-lg md:text-xl leading-relaxed max-w-xl mx-auto">
                Recognizing the elite minds pushing the boundaries of competitive programming. Join the ranks of the world's best.
            </p>

            {/* Decorative background elements can be added here if needed */}
        </div>
    );
}
