import { Lock, Code2, Send, Cpu, Trophy, Users, Key, Terminal, BookOpen } from 'lucide-react'

export const API_CATEGORIES = [
    {
        id: 'auth',
        title: 'Authentication',
        icon: <Lock className="size-5" />,
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        hoverBorder: 'hover:border-blue-500/50',
        description: 'Register, login, and manage user sessions.',
        endpoints: [
            {
                method: 'POST',
                path: '/api/auth/register',
                summary: 'Create a new user account',
                methodColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                request: `{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secureP@ss123"
}`,
                response: `{
  "success": true,
  "user": {
    "id": "usr_a1b2c3d4",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}`,
            },
            {
                method: 'POST',
                path: '/api/auth/login',
                summary: 'Authenticate a user and receive a session token',
                methodColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                request: `{
  "email": "john@example.com",
  "password": "secureP@ss123"
}`,
                response: `{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "usr_a1b2c3d4",
    "username": "john_doe",
    "role": "user"
  }
}`,
            },
            {
                method: 'POST',
                path: '/api/auth/logout',
                summary: 'Invalidate the current session',
                methodColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                request: null,
                response: `{
  "success": true,
  "message": "Logged out successfully"
}`,
            },
        ],
    },
    {
        id: 'problems',
        title: 'Problems',
        icon: <Code2 className="size-5" />,
        color: 'text-accent bg-accent/10 border-accent/20',
        hoverBorder: 'hover:border-accent/50',
        description: 'Browse, search, and retrieve coding problems.',
        endpoints: [
            {
                method: 'GET',
                path: '/api/problems',
                summary: 'List all problems with pagination & filters',
                methodColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                request: null,
                response: `{
  "problems": [
    {
      "id": "prob_001",
      "title": "Two Sum",
      "difficulty": "Easy",
      "tags": ["Array", "Hash Table"],
      "acceptance": 48.2
    }
  ],
  "total": 2500,
  "page": 1,
  "limit": 20
}`,
            },
            {
                method: 'GET',
                path: '/api/problems/:id',
                summary: 'Get a specific problem by ID',
                methodColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                request: null,
                response: `{
  "id": "prob_001",
  "title": "Two Sum",
  "description": "Given an array of integers...",
  "difficulty": "Easy",
  "tags": ["Array", "Hash Table"],
  "constraints": "2 ≤ nums.length ≤ 10⁴",
  "examples": [
    {
      "input": "nums = [2,7,11,15], target = 9",
      "output": "[0,1]"
    }
  ]
}`,
            },
            {
                method: 'GET',
                path: '/api/problems/by-tag',
                summary: 'Filter problems by tag (e.g. DP, Graph)',
                methodColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                request: null,
                response: `{
  "tag": "Dynamic Programming",
  "problems": [...],
  "count": 342
}`,
            },
        ],
    },
    {
        id: 'submissions',
        title: 'Submissions',
        icon: <Send className="size-5" />,
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        hoverBorder: 'hover:border-purple-500/50',
        description: 'Submit solutions and view submission history.',
        endpoints: [
            {
                method: 'POST',
                path: '/api/submissions',
                summary: 'Submit a solution to a problem',
                methodColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                request: `{
  "problemId": "prob_001",
  "language": "python",
  "code": "class Solution:\\n    def twoSum(self, nums, target):\\n        ..."
}`,
                response: `{
  "submissionId": "sub_x7y8z9",
  "status": "Accepted",
  "runtime": "42ms",
  "memory": "16.2 MB",
  "passedTests": 57,
  "totalTests": 57
}`,
            },
            {
                method: 'GET',
                path: '/api/submissions/:id',
                summary: 'Get details of a specific submission',
                methodColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                request: null,
                response: `{
  "id": "sub_x7y8z9",
  "problemId": "prob_001",
  "status": "Accepted",
  "language": "python",
  "runtime": "42ms",
  "memory": "16.2 MB",
  "createdAt": "2026-03-30T10:00:00Z"
}`,
            },
        ],
    },
    {
        id: 'execute',
        title: 'Code Execution',
        icon: <Cpu className="size-5" />,
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        hoverBorder: 'hover:border-amber-500/50',
        description: 'Run code in a sandboxed Docker environment.',
        endpoints: [
            {
                method: 'POST',
                path: '/api/execute',
                summary: 'Execute code against custom or problem test cases',
                methodColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                request: `{
  "language": "cpp",
  "code": "#include <iostream>\\nint main() { ... }",
  "input": "5\\n1 2 3 4 5",
  "timeLimit": 2000,
  "memoryLimit": 256
}`,
                response: `{
  "status": "Success",
  "stdout": "15",
  "stderr": "",
  "executionTime": "12ms",
  "memoryUsed": "3.4 MB"
}`,
            },
        ],
    },
    {
        id: 'contests',
        title: 'Contests',
        icon: <Trophy className="size-5" />,
        color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
        hoverBorder: 'hover:border-yellow-500/50',
        description: 'Manage and participate in live coding contests.',
        endpoints: [
            {
                method: 'GET',
                path: '/api/contests',
                summary: 'List all upcoming and past contests',
                methodColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                request: null,
                response: `{
  "contests": [
    {
      "id": "contest_42",
      "title": "Weekly Challenge #42",
      "startTime": "2026-04-01T14:00:00Z",
      "duration": 7200,
      "participants": 1230,
      "status": "upcoming"
    }
  ]
}`,
            },
            {
                method: 'GET',
                path: '/api/contests/:id',
                summary: 'Get contest details, problems, and standings',
                methodColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                request: null,
                response: `{
  "id": "contest_42",
  "title": "Weekly Challenge #42",
  "problems": ["prob_101", "prob_102", "prob_103"],
  "standings": [
    { "rank": 1, "user": "alice", "score": 300 }
  ]
}`,
            },
        ],
    },
    {
        id: 'leaderboard',
        title: 'Leaderboard',
        icon: <Users className="size-5" />,
        color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
        hoverBorder: 'hover:border-cyan-500/50',
        description: 'Global rankings and Elo rating data.',
        endpoints: [
            {
                method: 'GET',
                path: '/api/leaderboard',
                summary: 'Get the global leaderboard with Elo ratings',
                methodColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                request: null,
                response: `{
  "leaderboard": [
    {
      "rank": 1,
      "username": "competitive_king",
      "elo": 2847,
      "solved": 1892,
      "contests": 45
    }
  ],
  "total": 10000,
  "page": 1
}`,
            },
        ],
    },
]

export const QUICK_START_STEPS = [
    {
        step: '01',
        title: 'Get Your API Key',
        description:
            'Register an account and generate your personal API key from the dashboard settings.',
        icon: <Key className="size-5" />,
    },
    {
        step: '02',
        title: 'Make Your First Request',
        description: 'Use your key in the Authorization header to authenticate all API calls.',
        icon: <Terminal className="size-5" />,
    },
    {
        step: '03',
        title: 'Explore Endpoints',
        description:
            'Browse the full reference below to discover all available resources and actions.',
        icon: <BookOpen className="size-5" />,
    },
]

export const RATE_LIMITS = [
    { tier: 'Free', requests: '100 / hour', burst: '10 / min', color: 'text-text-muted' },
    { tier: 'Pro', requests: '1,000 / hour', burst: '50 / min', color: 'text-accent' },
    { tier: 'Enterprise', requests: 'Unlimited', burst: 'Custom', color: 'text-amber-500' },
]

export const ERROR_CODES = [
    {
        code: '400',
        title: 'Bad Request',
        desc: 'Invalid parameters or malformed JSON body.',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
        code: '401',
        title: 'Unauthorized',
        desc: 'Missing or invalid authentication token.',
        color: 'text-red-500 bg-red-500/10 border-red-500/20',
    },
    {
        code: '403',
        title: 'Forbidden',
        desc: 'Insufficient permissions for this action.',
        color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    },
    {
        code: '404',
        title: 'Not Found',
        desc: 'The requested resource does not exist.',
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
        code: '429',
        title: 'Rate Limited',
        desc: 'Too many requests. Slow down and retry.',
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    },
    {
        code: '500',
        title: 'Server Error',
        desc: 'Something went wrong on our end.',
        color: 'text-red-600 bg-red-600/10 border-red-600/20',
    },
]

export const AUTH_FEATURES = [
    { icon: 'lock', text: 'Bearer token authentication' },
    { icon: 'clock', text: 'Tokens expire after 7 days' },
    { icon: 'shield', text: 'All endpoints use HTTPS' },
]

export const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

export const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
}
