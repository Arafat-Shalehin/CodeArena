import { Terminal, Activity, ShieldCheck, Search, History, Cpu } from 'lucide-react'

export const featuresData = [
    {
        id: 'docker',
        icon: <Terminal />,
        title: 'Docker Sandbox Execution',
        desc: 'Real containerized code runner. Your solutions execute in isolated, secure Docker containers with strict resource limits for fair and safe evaluations.',
        proof: 'Secure Runtime',
        size: 'hero',
    },
    {
        id: 'judge',
        icon: <Activity />,
        title: 'Multi-Verdict Judge',
        desc: 'Beyond pass/fail. Get granular feedback with standard verdicts including ACCEPTED, TLE, MLE, and detailed RUNTIME_ERROR reports.',
        proof: 'Deep Feedback',
        size: 'mid',
    },
    {
        id: 'auth',
        icon: <ShieldCheck />,
        title: 'Firebase + JWT Auth',
        desc: 'Real secure login system. Enterprise-grade security combining Firebase for identity and JWT for stateless session management.',
        proof: 'Trusted Access',
    },
    {
        id: 'browser',
        icon: <Search />,
        title: 'Problem Browser',
        desc: 'Search, filter, and paginate through challenges by difficulty, tags, or title to find the perfect problem for your skill level.',
        proof: 'Smart Discovery',
    },
    {
        id: 'history',
        icon: <History />,
        title: 'Submission History',
        desc: 'Track your attempts per problem. Review previous solutions, analyze performance trends, and learn from every submission.',
        proof: 'Progress Tracking',
    },
    {
        id: 'apis',
        icon: <Cpu />,
        title: 'Contest & Leaderboard APIs',
        desc: 'Robust backend infrastructure powering real-time rankings and contest management, built to scale as the arena expands.',
        proof: 'Real-time Signals',
        size: 'mid',
    },
    {
        id: 'ai-interview',
        icon: <Activity />,
        title: 'AI Interviewer Alex',
        desc: 'Adaptive live interview mode with real-time feedback and scorecards tuned for big-tech loops.',
        proof: 'Interview Ready',
        size: 'mid',
    },
]
