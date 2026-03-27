import { Blocks, Terminal, ShieldCheck, Trophy } from 'lucide-react'

export const stepsData = [
    {
        step: 1,
        title: 'Choose a Challenge',
        desc: 'Select from hundreds of algorithm challenges across various difficulty levels.',
        icon: <Blocks />,
    },
    {
        step: 2,
        title: 'Code & Optimize',
        desc: 'Write your solution in our interactive editor and optimize for performance.',
        icon: <Terminal />,
    },
    {
        step: 3,
        title: 'Run & Verify',
        desc: 'Execute your code against hidden test cases to ensure edge-case coverage.',
        icon: <ShieldCheck />,
    },
    {
        step: 4,
        title: 'Compete & Climb',
        desc: 'Earn points, unlock achievements, and see your rank rise on the leaderboard.',
        icon: <Trophy />,
    },
]
