import { Terminal, Activity, ShieldCheck, Search, History, Cpu } from 'lucide-react'

export const featuresData = [
    {
        id: 'docker',
        icon: <Terminal />,
        title: 'Docker Sandbox',
        desc: 'Isolated container execution with strict resource limits.',
        proof: 'Secure Runtime',
        size: 'hero',
    },
    {
        id: 'judge',
        icon: <Activity />,
        title: 'Multi-Verdict Judge',
        desc: 'ACCEPTED, TLE, MLE, RUNTIME_ERROR — granular feedback.',
        proof: 'Deep Feedback',
    },
    {
        id: 'auth',
        icon: <ShieldCheck />,
        title: 'Firebase + JWT Auth',
        desc: 'Enterprise-grade auth with Firebase identity & JWT sessions.',
        proof: 'Trusted Access',
    },
    {
        id: 'browser',
        icon: <Search />,
        title: 'Problem Browser',
        desc: 'Search & filter challenges by difficulty, tags, or title.',
        proof: 'Smart Discovery',
    },
    {
        id: 'history',
        icon: <History />,
        title: 'Submission History',
        desc: 'Track attempts, review past solutions, analyze trends.',
        proof: 'Progress Tracking',
    },
    {
        id: 'apis',
        icon: <Cpu />,
        title: 'Contest & Leaderboard APIs',
        desc: 'Real-time rankings and contest infrastructure at scale.',
        proof: 'Real-time Signals',
    },
    {
        id: 'ai-interview',
        icon: <Activity />,
        title: 'AI Interviewer Alex',
        desc: 'Adaptive mock interviews with real-time big-tech feedback.',
        proof: 'Interview Ready',
    },
]
