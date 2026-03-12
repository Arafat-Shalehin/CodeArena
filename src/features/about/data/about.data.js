import {
    Target,
    Eye,
    Rocket,
    Users,
    Cpu,
    Layers,
    Globe,
    ShieldCheck,
    Zap,
    Code2,
    Trophy,
    History,
} from 'lucide-react'

/**
 * @typedef {Object} Feature
 * @property {React.ReactNode} icon - The icon component for the feature.
 * @property {string} title - The title of the feature.
 * @property {string} description - The description of the feature.
 */

/**
 * @typedef {Object} Stat
 * @property {string} label - The label of the statistic.
 * @property {string} value - The value of the statistic.
 */

/**
 * @type {Object}
 * @property {Object} hero - Hero section content.
 * @property {string} hero.title - Main title.
 * @property {string} hero.accentTitle - Accented title part.
 * @property {string} hero.subtitle - Hero subheadline.
 * @property {string} hero.cta - Primary call to action text.
 * @property {string} hero.secondaryCta - Secondary call to action text.
 * @property {Object} mission - Mission and Vision content.
 * @property {string} mission.title - Section title.
 * @property {Object} mission.mission - Mission details.
 * @property {Object} mission.vision - Vision details.
 * @property {Feature[]} features - Array of platform features.
 * @property {Object} community - Community section details.
 * @property {Stat[]} community.stats - Platform statistics.
 */
export const aboutContent = {
    hero: {
        title: 'Defining the Future of',
        accentTitle: 'Competitive Programming.',
        subtitle:
            'Built by developers, for developers. CodeArena is a high-performance platform designed to push the boundaries of algorithmic excellence and prepare the next generation of software engineers.',
        cta: 'Start Solving',
        secondaryCta: 'Join Discord',
    },
    mission: {
        title: 'Our Mission & Vision',
        mission: {
            icon: <Target className="h-6 w-6" />,
            title: 'Mission',
            description:
                'To democratize competitive programming by providing a free, accessible, and high-performance environment for developers worldwide to master algorithms and data structures.',
        },
        vision: {
            icon: <Eye className="h-6 w-6" />,
            title: 'Vision',
            description:
                'To become the global standard for technical interviews and competitive coding, bridging the gap between academic learning and industry excellence through AI-powered insights.',
        },
    },
    features: [
        {
            icon: <Zap />,
            title: 'Ultra-Fast Evaluation',
            description:
                'Milliseconds matter. Our distributed judge system evaluates submissions instantly with millisecond-level precision.',
        },
        {
            icon: <Cpu />,
            title: 'AI Analysis',
            description:
                "Get granular insights into your code's performance, time complexity, and memory efficiency using our proprietary AI engine.",
        },
        {
            icon: <ShieldCheck />,
            title: 'Secure Sandbox',
            description:
                'Your code runs in a high-security, isolated containerized environment, ensuring fair and safe execution for everyone.',
        },
        {
            icon: <Code2 />,
            title: 'Universal Support',
            description:
                'Support for 25+ programming languages including C++,  Python,  Java and JavaScript with industry-standard compilers.',
        },
        {
            icon: <Trophy />,
            title: 'Live Contests',
            description:
                'Participate in real-time global contests, climb the Elo-based leaderboard, and earn your place among the elite.',
        },
        {
            icon: <History />,
            title: 'Detailed History',
            description:
                'Comprehensive submission tracking and performance heatmaps to visualize your growth over time.',
        },
    ],
    community: {
        title: 'A Community-Driven Platform',
        description:
            "CodeArena isn't just a platform; it's a movement. We believe in open collaboration, transparent rankings, and building tools that developers actually love using.",
        stats: [
            { label: 'Global Users', value: '50k+' },
            { label: 'Problems Solved', value: '2M+' },
            { label: 'Live Contests', value: '500+' },
            { label: 'Countries', value: '120+' },
        ],
    },
}
