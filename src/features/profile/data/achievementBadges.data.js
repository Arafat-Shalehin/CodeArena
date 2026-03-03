import { Zap, Timer, Award, Star, Shield, BarChart2, Terminal, Bug } from 'lucide-react'

export const achievementBadges = [
    {
        id: 1,
        icon: <Zap />,
        color: 'text-accent',
        bg: 'bg-accent/10',
        border: 'border-accent/20',
        label: 'Problem Solver',
        earned: true,
    },
    {
        id: 2,
        icon: <Timer />,
        color: 'text-warning',
        bg: 'bg-warning/10',
        border: 'border-warning/20',
        label: 'Speed Demon',
        earned: true,
    },
    {
        id: 3,
        icon: <Award />,
        color: 'text-success',
        bg: 'bg-success/10',
        border: 'border-success/20',
        label: 'Contest Winner',
        earned: true,
    },
    {
        id: 4,
        icon: <Star />,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        label: 'Top Rated',
        earned: true,
    },
    { id: 5, icon: <Shield />, earned: false },
    { id: 6, icon: <BarChart2 />, earned: false },
    { id: 7, icon: <Terminal />, earned: false },
    { id: 8, icon: <Bug />, earned: false },
]
