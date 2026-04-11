/**
 * Blog data for CodeArena
 * Following SKILL.MD standards:
 * - Extracted from components
 * - Unique stable IDs
 * - Structured for easy mapping
 */

export const BLOG_POSTS = [
    {
        id: 'rust-real-time-leaderboards',
        tag: 'Engineering',
        date: 'Oct 24, 2024',
        readTime: '8m Read',
        title: 'Optimizing Rust for Real-time Leaderboards',
        description:
            'How we reduced latency by 40% using custom memory allocators and zero-copy deserialization in our backend architecture.',
        author: {
            name: 'Sarah Chen',
            avatar: 'https://i.pravatar.cc/150?u=sarah',
        },
        icon: 'Zap', // Lucide icon name
        img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'season-4-finals-strategy',
        tag: 'Contest Recap',
        date: 'Oct 18, 2024',
        readTime: '15m Read',
        title: 'Season 4 Finals: The Strategy That Won It All',
        description:
            'An in-depth analysis of the winning solutions from the Global Championship and the tactical risks taken by the top 3 players.',
        author: {
            name: 'Team Arena',
            avatar: 'https://i.pravatar.cc/150?u=team',
        },
        icon: 'Trophy', // Lucide icon name
        img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'mastering-dynamic-programming-2024',
        tag: 'Tutorials',
        date: 'Oct 12, 2024',
        readTime: '10m Read',
        title: 'Mastering Dynamic Programming in 2024',
        description:
            'Beyond the basics: advanced state-space compression techniques and memoization patterns for Gold-tier problems.',
        author: {
            name: 'Marcus Thorne',
            avatar: 'https://i.pravatar.cc/150?u=marcus',
        },
        icon: 'BookOpen', // Lucide icon name
        img: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'zero-trust-architecture-deep-dive',
        tag: 'Engineering',
        date: 'Oct 10, 2024',
        readTime: '12m Read',
        title: 'Zero Trust Architecture: A Deep Dive',
        description:
            "Securing distributed systems in 2024 requires more than just firewalls. Let's explore identity-based microsegmentation.",
        author: {
            name: 'Alex Volkov',
            avatar: 'https://i.pravatar.cc/150?u=alex',
        },
        icon: 'Shield',
        img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'system-design-distributed-lock',
        tag: 'System Design',
        date: 'Oct 05, 2024',
        readTime: '18m Read',
        title: 'Distributed Locking at Scale',
        description:
            'Lessons learned from building a high-throughput lock manager using Redis and Redlock algorithm.',
        author: {
            name: 'Sarah Chen',
            avatar: 'https://i.pravatar.cc/150?u=sarah',
        },
        icon: 'Lock',
        img: 'https://images.unsplash.com/photo-1510511459019-5dee2c1b18ad?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'react-19-compiler-exploration',
        tag: 'Engineering',
        date: 'Oct 01, 2024',
        readTime: '7m Read',
        title: 'React 19 Compiler: No More Memo?',
        description:
            "How the new React Compiler handles automatic memoization and what it means for your application's performance.",
        author: {
            name: 'Marcus Thorne',
            avatar: 'https://i.pravatar.cc/150?u=marcus',
        },
        icon: 'Code2',
        img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'global-contest-recap-sept',
        tag: 'Contest Recap',
        date: 'Sep 28, 2024',
        readTime: '10m Read',
        title: 'September Global Contest: Top Solutions Revealed',
        description:
            "Breaking down the most elegant solutions to the 'Interstellar Routing' problem from last week's contest.",
        author: {
            name: 'Team Arena',
            avatar: 'https://i.pravatar.cc/150?u=team',
        },
        icon: 'Trophy',
        img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'microservices-observability-guide',
        tag: 'Engineering',
        date: 'Sep 20, 2024',
        readTime: '15m Read',
        title: 'Observability in Microservices',
        description:
            'Implementing distributed tracing and structured logging to debug complex request flows across service boundaries.',
        author: {
            name: 'Alex Volkov',
            avatar: 'https://i.pravatar.cc/150?u=alex',
        },
        icon: 'BarChart3',
        img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'advanced-sql-optimization',
        tag: 'Engineering',
        date: 'Sep 15, 2024',
        readTime: '20m Read',
        title: 'Advanced SQL Optimization Techniques',
        description:
            'Beyond simple indexing: partition pruning, materialized views, and analyzer hints for postgres performance.',
        author: {
            name: 'Sarah Chen',
            avatar: 'https://i.pravatar.cc/150?u=sarah',
        },
        icon: 'Database',
        img: 'https://images.unsplash.com/photo-1544383335-c533a37337a2?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'web3-infrastructure-scaling',
        tag: 'Engineering',
        date: 'Sep 10, 2024',
        readTime: '14m Read',
        title: 'Scaling Web3 Infrastructure',
        description:
            'How we managed node availability and JSON-RPC latency during high-traffic mint events.',
        author: {
            name: 'Alex Volkov',
            avatar: 'https://i.pravatar.cc/150?u=alex',
        },
        icon: 'Network',
        img: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'clean-code-principles-2024',
        tag: 'Tutorials',
        date: 'Sep 05, 2024',
        readTime: '12m Read',
        title: 'Clean Code Principles for Modern JS',
        description:
            'Revisiting SOLID and DRY in the era of functional components and hooks. What still matters?',
        author: {
            name: 'Marcus Thorne',
            avatar: 'https://i.pravatar.cc/150?u=marcus',
        },
        icon: 'CheckCircle',
        img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'kubernetes-operator-pattern',
        tag: 'Engineering',
        date: 'Aug 30, 2024',
        readTime: '18m Read',
        title: 'The Kubernetes Operator Pattern',
        description:
            'Automating complex stateful application management using custom controllers and CRDs.',
        author: {
            name: 'Alex Volkov',
            avatar: 'https://i.pravatar.cc/150?u=alex',
        },
        icon: 'Container',
        img: 'https://images.unsplash.com/photo-1667372333318-3d440935d794?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'system-design-rate-limiter',
        tag: 'System Design',
        date: 'Aug 25, 2024',
        readTime: '15m Read',
        title: 'Designing a Global Rate Limiter',
        description:
            'Sliding window log vs. token bucket: choosing the right algorithm for a multi-region API.',
        author: {
            name: 'Sarah Chen',
            avatar: 'https://i.pravatar.cc/150?u=sarah',
        },
        icon: 'Activity',
        img: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'frontend-performance-vitals',
        tag: 'Engineering',
        date: 'Aug 20, 2024',
        readTime: '10m Read',
        title: 'Mastering Core Web Vitals',
        description:
            'Practical strategies for improving LCP and CLS in complex Next.js applications.',
        author: {
            name: 'Marcus Thorne',
            avatar: 'https://i.pravatar.cc/150?u=marcus',
        },
        icon: 'Zap',
        img: 'https://images.unsplash.com/photo-1504868584819-f8e90526354c?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'rust-wasm-optimization',
        tag: 'Engineering',
        date: 'Aug 15, 2024',
        readTime: '13m Read',
        title: 'Optimizing Rust for WebAssembly',
        description:
            'Reducing binary size and improving execution speed for heavy client-side computations.',
        author: {
            name: 'Sarah Chen',
            avatar: 'https://i.pravatar.cc/150?u=sarah',
        },
        icon: 'Cpu',
        img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'graphql-federation-scale',
        tag: 'System Design',
        date: 'Aug 10, 2024',
        readTime: '16m Read',
        title: 'GraphQL Federation at Scale',
        description:
            'How to manage a unified graph across 50+ microservices without losing developer velocity.',
        author: {
            name: 'Alex Volkov',
            avatar: 'https://i.pravatar.cc/150?u=alex',
        },
        icon: 'Share2',
        img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'automated-testing-strategy',
        tag: 'Tutorials',
        date: 'Aug 05, 2024',
        readTime: '11m Read',
        title: 'Modern Automated Testing Strategy',
        description:
            'Balancing unit, integration, and E2E tests for maximum confidence with minimum maintenance.',
        author: {
            name: 'Marcus Thorne',
            avatar: 'https://i.pravatar.cc/150?u=marcus',
        },
        icon: 'ClipboardCheck',
        img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'redis-caching-patterns',
        tag: 'Engineering',
        date: 'Aug 01, 2024',
        readTime: '14m Read',
        title: 'Advanced Redis Caching Patterns',
        description:
            'Cache-aside vs. Write-through: when to use each and how to handle cache invalidation.',
        author: {
            name: 'Sarah Chen',
            avatar: 'https://i.pravatar.cc/150?u=sarah',
        },
        icon: 'Zap',
        img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
    },
]

export const BLOG_CATEGORIES = [
    'All',
    'Tutorials',
    'Contest Recaps',
    'Engineering',
    'System Design',
]

export const FEATURED_POST = {
    id: 'ai-future-competitive-programming',
    title: 'The Future of AI in Competitive Programming',
    tag: 'Featured Article',
    readTime: '12 MIN READ',
    description:
        'Exploring how LLMs and autonomous agents are redefining the limits of algorithmic optimization and contest integrity in the modern era.',
    author: {
        name: 'Alex Volkov',
        role: 'Lead Architect',
        avatar: 'https://i.pravatar.cc/150?u=alex',
    },
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhAcz1VNENJFfctC22gOA430kPbcddqQK-eb6oYk-ZQAbSM1PF8Fh-1FF9n4l3zK8gwflwvwKhjEJd0PyvJhKLgZTidnBi182sKKofsXnLp1y8f0jmNmIkO8hbSomye4TAnNdLwm3rkap2NKj09xiYzNR_a1yKbjhc0LJV_CMDoRfXt735Ji-NiL-_a7TE--WjGrOd0KLbeDyh1q_5aC-3NeSiUibPWcOotmYmANuCIsOXbcYyFYMBMuqcDVK-ftlswK7b7GGCnyk',
}
