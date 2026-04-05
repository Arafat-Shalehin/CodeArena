export const NAV_SECTIONS = [
    {
        title: 'Overview',
        links: [
            { id: 'intro', label: 'Introduction' },
            { id: 'tech-stack', label: 'Tech Stack' },
            { id: 'status', label: 'Project Status' },
        ],
    },
    {
        title: 'Architecture',
        links: [
            { id: 'architecture', label: 'System Architecture' },
            { id: 'project-structure', label: 'Project Structure' },
            { id: 'data-models', label: 'Data Models' },
        ],
    },
    {
        title: 'Features',
        links: [
            { id: 'auth', label: 'Authentication' },
            { id: 'judge', label: 'Judge Engine' },
            { id: 'contests', label: 'Contests' },
            { id: 'leaderboard', label: 'Leaderboard' },
        ],
    },
    {
        title: 'API Reference',
        links: [
            { id: 'api-auth', label: 'Auth APIs' },
            { id: 'api-problems', label: 'Problems APIs' },
            { id: 'api-evaluation', label: 'Evaluation APIs' },
            { id: 'api-contests', label: 'Contest APIs' },
            { id: 'api-users', label: 'User APIs' },
            { id: 'api-admin', label: 'Admin APIs' },
        ],
    },
    {
        title: 'Deployment',
        links: [
            { id: 'local-dev', label: 'Local Development' },
            { id: 'docker', label: 'Docker Compose' },
            { id: 'env-vars', label: 'Environment Variables' },
            { id: 'scripts', label: 'NPM Scripts' },
        ],
    },
    {
        title: 'Reference',
        links: [
            { id: 'verdicts', label: 'Verdicts' },
            { id: 'routes', label: 'Page Routes' },
            { id: 'team', label: 'Team' },
        ],
    },
]

export const TECH_STACK = [
    {
        layer: 'Framework',
        tech: 'Next.js',
        version: '16.1.6',
        purpose: 'Full-stack app with App Router; handles both SSR pages and API routes',
    },
    {
        layer: 'UI Library',
        tech: 'React',
        version: '19.2.3',
        purpose: 'Component-based UI with Server & Client components',
    },
    {
        layer: 'Styling',
        tech: 'Tailwind CSS',
        version: 'v4',
        purpose: 'Utility-first CSS; Shadcn/ui components; Radix UI primitives',
    },
    {
        layer: 'Database',
        tech: 'MongoDB + Mongoose',
        version: '8.13.0',
        purpose: 'Primary data store for users, problems, submissions, contests',
    },
    {
        layer: 'Cache / Queue',
        tech: 'Redis',
        version: '5.11.0',
        purpose: 'Session caching, BullMQ job queues, Socket.IO adapter',
    },
    {
        layer: 'Auth (Client)',
        tech: 'Firebase Auth',
        version: '12.9.0',
        purpose: 'Client-side identity; synced to backend via JWT cookies',
    },
    {
        layer: 'Auth (Server)',
        tech: 'JWT + bcryptjs',
        version: '—',
        purpose: 'Server-side session validation and password hashing',
    },
    {
        layer: 'Code Execution',
        tech: 'Docker + dockerode',
        version: '4.0.9',
        purpose: 'Sandboxed execution of user-submitted code',
    },
    {
        layer: 'Real-time',
        tech: 'Socket.IO',
        version: '4.8.3',
        purpose: 'WebSocket layer (wired with Redis adapter; UI integration in progress)',
    },
    {
        layer: 'Job Queue',
        tech: 'BullMQ',
        version: '5.70.1',
        purpose: 'Async judging job queue backed by Redis',
    },
    {
        layer: 'Code Editor',
        tech: 'Monaco Editor',
        version: '4.7.0',
        purpose: 'VS Code–powered in-browser editor for problem workspace',
    },
    {
        layer: 'AI',
        tech: 'Google Gemini + Groq',
        version: '—',
        purpose: 'AI-powered features (hints, analysis, etc.)',
    },
    {
        layer: 'Animations',
        tech: 'Framer Motion + GSAP',
        version: '—',
        purpose: 'Page transitions, UI animations, scroll effects via Lenis',
    },
    {
        layer: '3D',
        tech: 'Three.js + R3F',
        version: '0.183.2',
        purpose: '3D visual effects (landing page / hero sections)',
    },
    {
        layer: 'Forms',
        tech: 'React Hook Form + Zod',
        version: '—',
        purpose: 'Form management and schema-based validation',
    },
    {
        layer: 'Data Fetching',
        tech: 'SWR',
        version: '2.4.0',
        purpose: 'Client-side data fetching with caching and revalidation',
    },
    {
        layer: 'Metrics',
        tech: 'prom-client',
        version: '15.1.3',
        purpose: 'Prometheus-compatible application metrics',
    },
    {
        layer: 'Testing',
        tech: 'Vitest + Testing Library',
        version: '—',
        purpose: 'Unit and component testing',
    },
]

export const VERDICTS = [
    {
        verdict: 'ACCEPTED',
        cls: 'badge-success',
        meaning: 'All test cases passed within time and memory limits.',
    },
    {
        verdict: 'WRONG_ANSWER',
        cls: 'badge-error',
        meaning: 'Output does not match expected output for one or more test cases.',
    },
    {
        verdict: 'TIME_LIMIT_EXCEEDED',
        cls: 'badge-warning',
        meaning: "Program did not complete within the problem's time limit.",
    },
    {
        verdict: 'MEMORY_LIMIT_EXCEEDED',
        cls: 'badge-warning',
        meaning: 'Program exceeded the allowed memory usage.',
    },
    {
        verdict: 'RUNTIME_ERROR',
        cls: 'badge-error',
        meaning: 'Program crashed or exited with a non-zero exit code.',
    },
    {
        verdict: 'COMPILATION_ERROR',
        cls: 'badge-error',
        meaning: 'Code failed to compile (C++, Java). Includes compiler error output.',
    },
    {
        verdict: 'PENDING',
        cls: 'badge-info',
        meaning: 'Submission is in the queue, awaiting a judge worker.',
    },
    {
        verdict: 'JUDGING',
        cls: 'badge-info',
        meaning: 'Currently being executed by the judge engine.',
    },
    {
        verdict: 'SYSTEM_ERROR',
        cls: 'badge-neutral',
        meaning: "Internal judge failure (e.g., Docker issue). Not the user's fault.",
    },
    {
        verdict: 'SECURITY_ERROR',
        cls: 'badge-neutral',
        meaning: 'Submission triggered a security constraint (e.g., restricted syscall).',
    },
]

export const SUPPORTED_LANGUAGES = [
    { name: 'C++', icon: 'Terminal', desc: 'Compiled with g++; fastest execution.' },
    { name: 'Python', icon: 'Bot', desc: 'Interpreted; python3 runtime.' },
    { name: 'Java', icon: 'Coffee', desc: 'Compiled with javac and run on JVM.' },
    { name: 'JavaScript', icon: 'FileCode', desc: 'Run with Node.js runtime.' },
]

export const TEAM = [
    { role: 'Team Lead', name: 'Rabiul Islam' },
    { role: 'Backend', name: 'Arafat Salehin' },
    { role: 'Backend', name: 'AH Muzahid' },
    { role: 'Frontend', name: 'Shahnawas Adeel' },
    { role: 'Frontend', name: 'Abdullah Noman' },
    { role: 'Frontend', name: 'Ummey Salma Tamanna' },
]

export const API_AUTH = [
    [
        'POST',
        '/api/auth/register',
        'None',
        'Create a new account. Body: {username, email, password}. Sets JWT cookie.',
    ],
    [
        'POST',
        '/api/auth/login',
        'None',
        'Authenticate with email/password. Sets JWT cookie on success.',
    ],
    ['POST', '/api/auth/logout', 'JWT', 'Clears the JWT cookie. Logs out the session.'],
    [
        'POST',
        '/api/auth/sync',
        'Firebase Token',
        'Syncs a Firebase-authenticated user to MongoDB. Issues JWT cookie.',
    ],
]

export const API_PROBLEMS = [
    [
        'GET',
        '/api/problems',
        'Optional',
        'List problems with search (?q=), tag filter, difficulty filter, and pagination (?page=&limit=). Returns solved status if authenticated.',
    ],
    [
        'GET',
        '/api/problems/[id]',
        'Optional',
        'Get a single problem by ID, including description, sample test cases, time/memory limits.',
    ],
    [
        'POST',
        '/api/problems/[id]/submit',
        'JWT Required',
        'Submit code for a problem. Body: {language, code}. Returns submission ID immediately; judging is async.',
    ],
]

export const API_EVALUATION = [
    [
        'POST',
        '/api/evaluation/execute',
        'Internal',
        'Run code in a Docker container. Body: {language, code, stdin}. Returns stdout, stderr, exitCode.',
    ],
    [
        'POST',
        '/api/evaluation/judge',
        'Internal',
        'Full judge run: execute against all test cases and compute verdict.',
    ],
    [
        'POST',
        '/api/evaluation/test',
        'JWT Required',
        'Run code against a single custom test input (for the "Run" button). Not recorded as a submission.',
    ],
    [
        'GET',
        '/api/evaluation/status',
        'JWT Required',
        'Poll for the current verdict of a pending/judging submission. Query: ?id=submissionId.',
    ],
]

export const API_CONTESTS = [
    ['GET', '/api/contests', 'None', 'List all contests (upcoming, active, ended).'],
    ['POST', '/api/contests', 'Admin JWT', 'Create a new contest.'],
    ['GET', '/api/contests/[id]', 'None', 'Get contest details including problems list.'],
    [
        'POST',
        '/api/contests/[id]/register',
        'JWT Required',
        'Register the authenticated user for the contest.',
    ],
    [
        'GET',
        '/api/contests/[id]/participants',
        'None',
        'List all registered participants for the contest.',
    ],
    [
        'GET',
        '/api/contests/[id]/leaderboard',
        'None',
        'Fetch the contest leaderboard, ranked by accepted problems and penalty.',
    ],
]

export const API_USERS = [
    ['GET', '/api/users', 'JWT', 'List all users (admin use).'],
    ['GET', '/api/users/[id]', 'None', 'Get public profile data for a user by ID.'],
    [
        'GET',
        '/api/user/problems-status',
        'JWT Required',
        "Returns the authenticated user's solved/attempted problem list.",
    ],
    [
        'GET',
        '/api/submissions',
        'JWT Required',
        'List submissions for the authenticated user (or all, for admins).',
    ],
    [
        'GET',
        '/api/submissions/[id]',
        'JWT Required',
        'Get full details of a specific submission including per-test-case results.',
    ],
    ['GET', '/api/health', 'None', 'Health check endpoint. Returns server/DB/Redis status.'],
]

export const API_ADMIN = [
    ['GET', '/api/admin/logs', 'Admin JWT', 'Retrieve all admin action logs with pagination.'],
    ['GET', '/api/admin/logs/[id]', 'Admin JWT', 'Get a specific admin log entry by ID.'],
]

export const FEATURES_DATA = [
    {
        id: 'docker',
        icon: 'Terminal',
        title: 'Docker Sandbox Execution',
        desc: 'Real containerized code runner. Your solutions execute in isolated, secure Docker containers with strict resource limits for fair and safe evaluations.',
        badge: 'Secure Runtime',
    },
    {
        id: 'judge',
        icon: 'Activity',
        title: 'Multi-Verdict Judge',
        desc: 'Beyond pass/fail. Get granular feedback with standard verdicts including ACCEPTED, TLE, MLE, and detailed RUNTIME_ERROR reports.',
        badge: 'Deep Feedback',
    },
    {
        id: 'auth',
        icon: 'ShieldCheck',
        title: 'Firebase + JWT Auth',
        desc: 'Real secure login system. Enterprise-grade security combining Firebase for identity and JWT for stateless session management.',
        badge: 'Trusted Access',
    },
    {
        id: 'browser',
        icon: 'Search',
        title: 'Problem Browser',
        desc: 'Search, filter, and paginate through challenges by difficulty, tags, or title to find the perfect problem for your skill level.',
        badge: 'Smart Discovery',
    },
    {
        id: 'history',
        icon: 'History',
        title: 'Submission History',
        desc: 'Track your attempts per problem. Review previous solutions, analyze performance trends, and learn from every submission.',
        badge: 'Progress Tracking',
    },
    {
        id: 'apis',
        icon: 'Cpu',
        title: 'Contest & Leaderboard APIs',
        desc: 'Robust backend infrastructure powering real-time rankings and contest management, built to scale as the arena expands.',
        badge: 'Real-time Signals',
    },
    {
        id: 'ai-interview',
        icon: 'Activity',
        title: 'AI Interviewer Alex',
        desc: 'Adaptive live interview mode with real-time feedback and scorecards tuned for big-tech loops.',
        badge: 'Interview Ready',
    },
]

export const STEPS_DATA = [
    {
        step: 1,
        title: 'Choose a Challenge',
        desc: 'Select from hundreds of algorithm challenges across various difficulty levels.',
        icon: 'Blocks',
    },
    {
        step: 2,
        title: 'Code & Optimize',
        desc: 'Write your solution in our interactive editor and optimize for performance.',
        icon: 'Terminal',
    },
    {
        step: 3,
        title: 'Run & Verify',
        desc: 'Execute your code against hidden test cases to ensure edge-case coverage.',
        icon: 'ShieldCheck',
    },
    {
        step: 4,
        title: 'Compete & Climb',
        desc: 'Earn points, unlock achievements, and see your rank rise on the leaderboard.',
        icon: 'Trophy',
    },
]

export const PAGE_ROUTES = [
    ['/', 'None', 'Landing page with 3D hero, animations (Three.js, GSAP, Framer Motion)'],
    ['/login', 'None', 'Email/password + Firebase login form'],
    ['/signup', 'None', 'Registration form with validation (Zod + React Hook Form)'],
    ['/problems', 'None', 'Paginated problem browser with search and tag/difficulty filters'],
    ['/problems/[id]', 'JWT for Submit', 'Problem detail + Monaco editor + Run + Submit'],
    ['/leaderboard', 'None', 'Global user leaderboard'],
    ['/profile', 'JWT', 'Own profile page with activity calendar and stats'],
    ['/profile/[id]', 'None', 'Public profile view for any user'],
    ['/profile/settings', 'JWT', 'Account settings (avatar, username, etc.)'],
    ['/userdashboard', 'JWT', 'Personal dashboard: recent submissions, stats, activity'],
    ['/practice', 'None', 'Placeholder — "Coming Soon"'],
    ['/test-docker', 'None (dev)', 'Debug interface to test Docker execution pipeline'],
]

export const DOCKER_SERVICES = [
    [
        'mongodb',
        'mongo:latest',
        '27017',
        'Primary database with health check and persistent volume',
    ],
    [
        'redis',
        'redis:7',
        '6379',
        'Cache, BullMQ queue, Socket.IO adapter; AOF persistence enabled, 256 MB limit',
    ],
    [
        'app',
        'Local build',
        '3001→3000',
        'Next.js production app; waits for MongoDB and docker-proxy',
    ],
    [
        'docker-proxy',
        'tecnativa/docker-socket-proxy',
        '2376 (host)',
        'Restricted Docker socket proxy; only exposes CONTAINERS, IMAGES, EXEC, POST',
    ],
]

export const ENV_VARS = [
    ['MONGODB_URI', 'Yes', 'Full MongoDB connection string (with auth if applicable)'],
    ['JWT_SECRET', 'Yes', 'Secret key used to sign/verify JWT tokens — keep this private'],
    ['REDIS_HOST', 'Yes', 'Redis server hostname (e.g., localhost or redis in Docker)'],
    ['REDIS_PORT', 'Yes', 'Redis port (default 6379)'],
    ['REDIS_PASSWORD', 'Yes', 'Redis auth password'],
    ['REDIS_URL', 'Optional', 'Full Redis URL (alternative to HOST/PORT/PASSWORD)'],
    [
        'DOCKER_HOST',
        'Auto (compose)',
        'Docker API host. Set to http://docker-proxy:2375 in Docker Compose',
    ],
    ['NODE_ENV', 'Optional', 'development | production'],
    ['NEXT_PUBLIC_FIREBASE_API_KEY', 'Yes', 'Firebase project API key (client-side)'],
    ['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'Yes', 'Firebase auth domain'],
    ['NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'Yes', 'Firebase project ID'],
    ['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'Yes', 'Firebase storage bucket'],
    ['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', 'Yes', 'Firebase messaging sender'],
    ['NEXT_PUBLIC_FIREBASE_APP_ID', 'Yes', 'Firebase app ID'],
    ['NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', 'Optional', 'Firebase Analytics measurement ID'],
]

export const NPM_SCRIPTS = [
    ['npm run dev', 'next dev', 'Start Next.js development server with hot reload on port 3000'],
    ['npm run build', 'next build', 'Create an optimized production build'],
    ['npm run start', 'next start', 'Run the production build (requires npm run build first)'],
    ['npm run lint', 'eslint', 'Run ESLint across the codebase'],
    [
        'npm run docker:build',
        'bash docker/scripts/build-images.sh',
        'Build all language executor Docker images for the judge',
    ],
    ['npm run prepare', 'husky install', 'Set up Husky Git hooks (auto-runs on npm install)'],
]

export const USER_MODEL = [
    ['_id', 'ObjectId', 'MongoDB document ID'],
    ['uid', 'String', 'Firebase UID (synced from client auth)'],
    ['username', 'String', 'Unique display name'],
    ['email', 'String', 'User email address (unique)'],
    ['passwordHash', 'String', 'bcryptjs-hashed password'],
    ['role', 'String', 'Enum: user | admin'],
    ['solvedProblems', 'ObjectId[]', 'References to solved Problem documents'],
    ['createdAt', 'Date', 'Account creation timestamp'],
]

export const PROBLEM_MODEL = [
    ['_id', 'ObjectId', 'Document ID'],
    ['title', 'String', 'Problem title'],
    ['slug', 'String', 'URL-friendly identifier'],
    ['difficulty', 'String', 'Enum: easy | medium | hard'],
    ['tags', 'String[]', 'Algorithm/topic tags (e.g., "dp", "graph")'],
    ['description', 'String', 'Markdown problem statement (supports LaTeX via KaTeX)'],
    ['inputFormat', 'String', 'Input specification'],
    ['outputFormat', 'String', 'Output specification'],
    ['testCases', 'Array', 'Array of {input, expectedOutput} objects'],
    ['timeLimit', 'Number', 'Time limit in milliseconds'],
    ['memoryLimit', 'Number', 'Memory limit in MB'],
    ['sampleTestCases', 'Array', 'Publicly visible sample cases'],
]

export const SUBMISSION_MODEL = [
    ['_id', 'ObjectId', 'Document ID'],
    ['userId', 'ObjectId', 'Reference to User'],
    ['problemId', 'ObjectId', 'Reference to Problem'],
    ['language', 'String', 'Enum: cpp | python | java | javascript'],
    ['code', 'String', 'Raw source code'],
    ['verdict', 'String', 'One of the 9 possible verdicts'],
    ['executionTime', 'Number', 'Runtime in ms'],
    ['memoryUsed', 'Number', 'Memory consumption in KB'],
    ['testCaseResults', 'Array', 'Per-test-case result details'],
    ['createdAt', 'Date', 'Submission timestamp'],
]

export const CONTEST_MODEL = [
    ['_id', 'ObjectId', 'Document ID'],
    ['title', 'String', 'Contest name'],
    ['description', 'String', 'Contest description'],
    ['startTime', 'Date', 'Contest start datetime'],
    ['endTime', 'Date', 'Contest end datetime'],
    ['problems', 'ObjectId[]', 'List of Problem references'],
    ['participants', 'ObjectId[]', 'Registered user references'],
    ['createdBy', 'ObjectId', 'Admin user reference'],
]

export const FLOW_SUBMISSION = [
    {
        num: '1',
        title: 'User submits code',
        desc: 'Monaco editor POSTs to POST /api/problems/[id]/submit with language and source code.',
    },
    {
        num: '2',
        title: 'Auth middleware validates JWT cookie',
        desc: "The request passes through middleware that verifies the user's JWT before reaching the controller.",
    },
    {
        num: '3',
        title: 'Submission record created (PENDING)',
        desc: 'The submission controller creates a MongoDB document with status PENDING and enqueues a BullMQ job.',
    },
    {
        num: '4',
        title: 'Judge worker picks up the job',
        desc: 'A BullMQ worker (backed by Redis) processes the job by calling the judge service.',
    },
    {
        num: '5',
        title: 'Docker container spun up via dockerode',
        desc: 'The judge calls POST /api/evaluation/execute which uses dockerode → docker-proxy → Docker Engine to create a sandboxed container.',
    },
    {
        num: '6',
        title: 'Output compared against test cases',
        desc: 'Stdout is compared to expected output. Timing and memory are measured. A verdict is produced.',
    },
    {
        num: '7',
        title: 'Submission updated in MongoDB',
        desc: 'The submission document is updated with the final verdict (e.g., ACCEPTED, WRONG_ANSWER) and execution stats.',
    },
    {
        num: '8',
        title: 'Client polls for result',
        desc: 'Frontend polls GET /api/evaluation/status or GET /api/submissions/[id] until the verdict is available.',
    },
]

export const FLOW_AUTH = [
    {
        num: 'A',
        title: 'Register / Login (Native)',
        desc: 'POST /api/auth/register or POST /api/auth/login — password hashed with bcryptjs, user stored in MongoDB, JWT issued as an HttpOnly cookie.',
    },
    {
        num: 'B',
        title: 'Firebase Sync',
        desc: 'POST /api/auth/sync — client sends Firebase ID token; server verifies it via Firebase Admin SDK, then upserts the user in MongoDB and issues its own JWT cookie.',
    },
    {
        num: 'C',
        title: 'Authenticated Requests',
        desc: 'All protected API routes run through authMiddleware.js which reads and verifies the token HttpOnly cookie using jsonwebtoken.',
    },
    {
        num: 'D',
        title: 'Logout',
        desc: 'POST /api/auth/logout — clears the JWT cookie on the server side.',
    },
]

export const FLOW_DOCKERFILE = [
    {
        num: '1',
        title: 'Stage: deps (node:20-alpine)',
        desc: 'Installs only npm dependencies. Husky is disabled in CI/Docker via ENV HUSKY=0.',
    },
    {
        num: '2',
        title: 'Stage: builder (node:20-alpine)',
        desc: 'Copies deps and source, accepts Firebase env vars as build-time ARGs, and runs next build with telemetry disabled.',
    },
    {
        num: '3',
        title: 'Stage: runner (node:20-alpine)',
        desc: 'Copies only the Next.js standalone output and static assets. Runs as a non-root nextjs user (UID 1001) on port 3000.',
    },
]
