import { Blocks, Terminal, ShieldCheck, Trophy } from 'lucide-react'

export const stepsData = [
    {
        step: 1,
        tag: 'BASE CAMP',
        title: 'Build your identity.',
        desc: 'Create your profile, pick your languages, and enter the arena with Firebase + JWT auth.',
        icon: <Blocks />,
        elevation: '0m',
    },
    {
        step: 2,
        tag: 'CAMP 1',
        title: 'Pick your battlefield.',
        desc: 'Filter by difficulty, topic, or acceptance rate. Every problem has real constraints and test suites.',
        icon: <Terminal />,
        elevation: '1,400m',
    },
    {
        step: 3,
        tag: 'CAMP 2',
        title: 'Write. Run. Iterate.',
        desc: 'Your code runs inside a Docker sandbox. Every submission gets a precise verdict with full details.',
        icon: <ShieldCheck />,
        elevation: '2,800m',
    },
    {
        step: 4,
        tag: 'SUMMIT',
        title: 'Climb. Dominate. Repeat.',
        desc: 'Accepted solutions move your rank. Contest leaderboards shift in real time on global standings.',
        icon: <Trophy />,
        elevation: '4,000m',
    },
]
