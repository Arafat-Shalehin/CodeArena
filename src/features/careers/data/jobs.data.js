/**
 * Mock data for CodeArena open roles and career content.
 */

export const JOB_ROLES = [
    {
        id: 'role-1',
        title: 'Senior Software Engineer (Full-Stack)',
        department: 'Engineering',
        location: 'Remote / Bangalore',
        type: 'Full-time',
        description:
            'Help us scale our automated judge infrastructure to support millions of concurrent submissions.',
        requirements: [
            '5+ years of experience with React, Next.js, and Node.js',
            'Strong understanding of Docker and container orchestration',
            'Passion for competitive programming and algorithm design',
            'Experienced in building scalable distributed systems',
        ],
        perks: ['Equity', 'Flexible hours', 'Top-tier medical insurance'],
    },
    {
        id: 'role-2',
        title: 'Developer Advocate (DevRel)',
        department: 'Marketing & Community',
        location: 'Remote',
        type: 'Full-time',
        description:
            'Bridge the gap between CodeArena and the global developer community through content and events.',
        requirements: [
            'Proven track record in community building or technical writing',
            'Active presence in CP communities (Codeforces, LeetCode, etc.)',
            'Excellent communication and public speaking skills',
            'Background in software development',
        ],
        perks: ['Travel budget', 'Learning stipend', 'Performance bonuses'],
    },
    {
        id: 'role-3',
        title: 'Product Designer',
        department: 'Product',
        location: 'Remote / San Francisco',
        type: 'Full-time',
        description:
            'Design the next generation of competitive programming interfaces and collaborative coding tools.',
        requirements: [
            'Portfolio demonstrating expertise in UI/UX for developer tools',
            'Proficiency in Figma and Framer Motion for prototyping',
            'Deep understanding of design systems and typography',
            'Ability to translate complex user flows into elegant experiences',
        ],
        perks: ['Wellness allowance', 'Newest Apple hardware', 'Home office setup budget'],
    },
]

export const PERKS = [
    {
        id: 'perk-1',
        title: 'Remote-First Culture',
        description: 'Work from anywhere in the world. We value output over seat time.',
        icon: '🌍',
    },
    {
        id: 'perk-2',
        title: 'Competitive Equity',
        description: 'Be a true owner. We offer generous equity packages to all early employees.',
        icon: '📈',
    },
    {
        id: 'perk-3',
        title: 'Health & Wellness',
        description: 'Comprehensive medical, dental, and vision insurance for you and your family.',
        icon: '🏥',
    },
    {
        id: 'perk-4',
        title: 'Modern Tech Stack',
        description: 'Build with the latest technologies (Next.js, Tailwind, Docker, AI Agents).',
        icon: '🚀',
    },
]
