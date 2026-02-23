/**
 * Leaderboard Mock Data
 *
 * Contains realistic mock data for the global leaderboard.
 * Data shape matches the backend API response from:
 * GET /api/contests/{contestId}/leaderboard
 *
 * Each entry mirrors the Leaderboard model with populated userId.
 * This data drives the StatsGrid, TopThreePodium, and RankingsTable components.
 */

/**
 * Platform-wide statistics displayed in the stats grid
 */
export const leaderboardStats = [
    {
        label: "Total Participants",
        value: "124,032",
        trend: "+1.2%",
        trendUp: true,
    },
    {
        label: "Submissions Today",
        value: "45,892",
        trend: "+5.4%",
        trendUp: true,
    },
    {
        label: "Active Contests",
        value: "12",
        trend: "Stable",
        trendUp: null,
    },
    {
        label: "Avg. Solve Rate",
        value: "68.5%",
        trend: "-0.5%",
        trendUp: false,
    },
];

/**
 * Global leaderboard users (top 50)
 *
 * Data shape follows the backend data modeling:
 * {
 *   _id, contestId, rank, score, submissions, penalty,
 *   lastSubmissionAt, finalized,
 *   userId: { _id, name, username, email, stats: { totalSubmissions, score } }
 * }
 *
 * Positions 1-3 are featured in the podium
 * Positions 4+ are shown in the rankings table
 */
export const leaderboardUsers = [
    // Top 3 - Featured in Podium
    { _id: "lb1", contestId: "global", rank: 1, score: 31200, submissions: 1842, penalty: 0, lastSubmissionAt: "2026-02-18T14:30:00.000Z", finalized: true, userId: { _id: "u1", name: "CodeGod 99", username: "CodeGod_99", email: "codegod99@codearena.com", stats: { totalSubmissions: 1842, score: 31200 } }, title: "Supreme Architect", country: "USA", streak: 127 },
    { _id: "lb2", contestId: "global", rank: 2, score: 29800, submissions: 1753, penalty: 0, lastSubmissionAt: "2026-02-18T13:45:00.000Z", finalized: true, userId: { _id: "u2", name: "Algo Master", username: "algo_master", email: "algomaster@codearena.com", stats: { totalSubmissions: 1753, score: 29800 } }, title: "Elite Engineer", country: "China", streak: 98 },
    { _id: "lb3", contestId: "global", rank: 3, score: 28100, submissions: 1690, penalty: 0, lastSubmissionAt: "2026-02-18T12:30:00.000Z", finalized: true, userId: { _id: "u3", name: "Bug Hunter", username: "bug_hunter", email: "bughunter@codearena.com", stats: { totalSubmissions: 1690, score: 28100 } }, title: "Senior Developer", country: "India", streak: 85 },

    // Ranks 4-50 - Shown in Table
    { _id: "lb4", contestId: "global", rank: 4, score: 26900, submissions: 1580, penalty: 0, lastSubmissionAt: "2026-02-18T11:00:00.000Z", finalized: true, userId: { _id: "u4", name: "Code Ninja", username: "code_ninja", email: "codeninja@codearena.com", stats: { totalSubmissions: 1580, score: 26900 } }, title: "Lead Developer", country: "Japan", streak: 72 },
    { _id: "lb5", contestId: "global", rank: 5, score: 25800, submissions: 1520, penalty: 0, lastSubmissionAt: "2026-02-18T10:00:00.000Z", finalized: true, userId: { _id: "u5", name: "Debug Master", username: "debug_master", email: "debugmaster@codearena.com", stats: { totalSubmissions: 1520, score: 25800 } }, title: "Principal Engineer", country: "Germany", streak: 64 },
    { _id: "lb6", contestId: "global", rank: 6, score: 24700, submissions: 1465, penalty: 0, lastSubmissionAt: "2026-02-18T09:00:00.000Z", finalized: true, userId: { _id: "u6", name: "Stack Overflow", username: "stack_overflow", email: "stackoverflow@codearena.com", stats: { totalSubmissions: 1465, score: 24700 } }, title: "Tech Lead", country: "UK", streak: 58 },
    { _id: "lb7", contestId: "global", rank: 7, score: 23600, submissions: 1410, penalty: 0, lastSubmissionAt: "2026-02-17T14:00:00.000Z", finalized: true, userId: { _id: "u7", name: "Binary Boss", username: "binary_boss", email: "binaryboss@codearena.com", stats: { totalSubmissions: 1410, score: 23600 } }, title: "Solutions Architect", country: "Canada", streak: 51 },
    { _id: "lb8", contestId: "global", rank: 8, score: 22900, submissions: 1380, penalty: 0, lastSubmissionAt: "2026-02-17T13:00:00.000Z", finalized: true, userId: { _id: "u8", name: "Syntax King", username: "syntax_king", email: "syntaxking@codearena.com", stats: { totalSubmissions: 1380, score: 22900 } }, title: "Staff Engineer", country: "France", streak: 47 },
    { _id: "lb9", contestId: "global", rank: 9, score: 22100, submissions: 1340, penalty: 0, lastSubmissionAt: "2026-02-17T12:00:00.000Z", finalized: true, userId: { _id: "u9", name: "Loop Legend", username: "loop_legend", email: "looplegend@codearena.com", stats: { totalSubmissions: 1340, score: 22100 } }, title: "Senior Developer", country: "Brazil", streak: 43 },
    { _id: "lb10", contestId: "global", rank: 10, score: 21400, submissions: 1298, penalty: 0, lastSubmissionAt: "2026-02-17T11:00:00.000Z", finalized: true, userId: { _id: "u10", name: "Data Wizard", username: "data_wizard", email: "datawizard@codearena.com", stats: { totalSubmissions: 1298, score: 21400 } }, title: "Engineering Manager", country: "Australia", streak: 39 },

    { _id: "lb11", contestId: "global", rank: 11, score: 20800, submissions: 1256, penalty: 0, lastSubmissionAt: "2026-02-16T14:00:00.000Z", finalized: true, userId: { _id: "u11", name: "Refactor Guru", username: "refactor_guru", email: "refactorguru@codearena.com", stats: { totalSubmissions: 1256, score: 20800 } }, title: "Lead Developer", country: "South Korea", streak: 36 },
    { _id: "lb12", contestId: "global", rank: 12, score: 20200, submissions: 1220, penalty: 0, lastSubmissionAt: "2026-02-16T13:00:00.000Z", finalized: true, userId: { _id: "u12", name: "API Architect", username: "api_architect", email: "apiarchitect@codearena.com", stats: { totalSubmissions: 1220, score: 20200 } }, title: "Principal Engineer", country: "Netherlands", streak: 33 },
    { _id: "lb13", contestId: "global", rank: 13, score: 19700, submissions: 1189, penalty: 0, lastSubmissionAt: "2026-02-16T12:00:00.000Z", finalized: true, userId: { _id: "u13", name: "Thread Master", username: "thread_master", email: "threadmaster@codearena.com", stats: { totalSubmissions: 1189, score: 19700 } }, title: "Tech Lead", country: "Sweden", streak: 30 },
    { _id: "lb14", contestId: "global", rank: 14, score: 19100, submissions: 1154, penalty: 0, lastSubmissionAt: "2026-02-16T11:00:00.000Z", finalized: true, userId: { _id: "u14", name: "Cache Hero", username: "cache_hero", email: "cachehero@codearena.com", stats: { totalSubmissions: 1154, score: 19100 } }, title: "Senior Developer", country: "Singapore", streak: 28 },
    { _id: "lb15", contestId: "global", rank: 15, score: 18600, submissions: 1125, penalty: 0, lastSubmissionAt: "2026-02-15T14:00:00.000Z", finalized: true, userId: { _id: "u15", name: "Commit Champion", username: "commit_champion", email: "commitchampion@codearena.com", stats: { totalSubmissions: 1125, score: 18600 } }, title: "Staff Engineer", country: "Russia", streak: 25 },
    { _id: "lb16", contestId: "global", rank: 16, score: 18100, submissions: 1092, penalty: 0, lastSubmissionAt: "2026-02-15T13:00:00.000Z", finalized: true, userId: { _id: "u16", name: "Merge Master", username: "merge_master", email: "mergemaster@codearena.com", stats: { totalSubmissions: 1092, score: 18100 } }, title: "Solutions Architect", country: "Spain", streak: 23 },
    { _id: "lb17", contestId: "global", rank: 17, score: 17700, submissions: 1067, penalty: 0, lastSubmissionAt: "2026-02-15T12:00:00.000Z", finalized: true, userId: { _id: "u17", name: "Push Pro", username: "push_pro", email: "pushpro@codearena.com", stats: { totalSubmissions: 1067, score: 17700 } }, title: "Lead Developer", country: "Italy", streak: 21 },
    { _id: "lb18", contestId: "global", rank: 18, score: 17200, submissions: 1038, penalty: 0, lastSubmissionAt: "2026-02-15T11:00:00.000Z", finalized: true, userId: { _id: "u18", name: "Pull Prodigy", username: "pull_prodigy", email: "pullprodigy@codearena.com", stats: { totalSubmissions: 1038, score: 17200 } }, title: "Principal Engineer", country: "Poland", streak: 19 },
    { _id: "lb19", contestId: "global", rank: 19, score: 16800, submissions: 1015, penalty: 0, lastSubmissionAt: "2026-02-14T14:00:00.000Z", finalized: true, userId: { _id: "u19", name: "Branch Boss", username: "branch_boss", email: "branchboss@codearena.com", stats: { totalSubmissions: 1015, score: 16800 } }, title: "Engineering Manager", country: "Mexico", streak: 17 },
    { _id: "lb20", contestId: "global", rank: 20, score: 16400, submissions: 989, penalty: 0, lastSubmissionAt: "2026-02-14T13:00:00.000Z", finalized: true, userId: { _id: "u20", name: "Deploy Deity", username: "deploy_deity", email: "deploydeity@codearena.com", stats: { totalSubmissions: 989, score: 16400 } }, title: "Tech Lead", country: "Argentina", streak: 16 },

    { _id: "lb21", contestId: "global", rank: 21, score: 16000, submissions: 967, penalty: 0, lastSubmissionAt: "2026-02-14T12:00:00.000Z", finalized: true, userId: { _id: "u21", name: "Docker Don", username: "docker_don", email: "dockerdon@codearena.com", stats: { totalSubmissions: 967, score: 16000 } }, title: "Senior Developer", country: "Turkey", streak: 14 },
    { _id: "lb22", contestId: "global", rank: 22, score: 15600, submissions: 942, penalty: 0, lastSubmissionAt: "2026-02-14T11:00:00.000Z", finalized: true, userId: { _id: "u22", name: "Kube King", username: "kube_king", email: "kubeking@codearena.com", stats: { totalSubmissions: 942, score: 15600 } }, title: "Staff Engineer", country: "Israel", streak: 13 },
    { _id: "lb23", contestId: "global", rank: 23, score: 15300, submissions: 923, penalty: 0, lastSubmissionAt: "2026-02-13T14:00:00.000Z", finalized: true, userId: { _id: "u23", name: "Cloud Captain", username: "cloud_captain", email: "cloudcaptain@codearena.com", stats: { totalSubmissions: 923, score: 15300 } }, title: "Solutions Architect", country: "UAE", streak: 12 },
    { _id: "lb24", contestId: "global", rank: 24, score: 14900, submissions: 898, penalty: 0, lastSubmissionAt: "2026-02-13T13:00:00.000Z", finalized: true, userId: { _id: "u24", name: "Lambda Lord", username: "lambda_lord", email: "lambdalord@codearena.com", stats: { totalSubmissions: 898, score: 14900 } }, title: "Lead Developer", country: "Indonesia", streak: 11 },
    { _id: "lb25", contestId: "global", rank: 25, score: 14600, submissions: 879, penalty: 0, lastSubmissionAt: "2026-02-13T12:00:00.000Z", finalized: true, userId: { _id: "u25", name: "Async Ace", username: "async_ace", email: "asyncace@codearena.com", stats: { totalSubmissions: 879, score: 14600 } }, title: "Principal Engineer", country: "Vietnam", streak: 10 },
    { _id: "lb26", contestId: "global", rank: 26, score: 14200, submissions: 856, penalty: 0, lastSubmissionAt: "2026-02-12T14:00:00.000Z", finalized: true, userId: { _id: "u26", name: "Promise Pro", username: "promise_pro", email: "promisepro@codearena.com", stats: { totalSubmissions: 856, score: 14200 } }, title: "Engineering Manager", country: "Thailand", streak: 9 },
    { _id: "lb27", contestId: "global", rank: 27, score: 13900, submissions: 838, penalty: 0, lastSubmissionAt: "2026-02-12T13:00:00.000Z", finalized: true, userId: { _id: "u27", name: "Callback Champ", username: "callback_champ", email: "callbackchamp@codearena.com", stats: { totalSubmissions: 838, score: 13900 } }, title: "Tech Lead", country: "Malaysia", streak: 9 },
    { _id: "lb28", contestId: "global", rank: 28, score: 13600, submissions: 820, penalty: 0, lastSubmissionAt: "2026-02-12T12:00:00.000Z", finalized: true, userId: { _id: "u28", name: "Event Expert", username: "event_expert", email: "eventexpert@codearena.com", stats: { totalSubmissions: 820, score: 13600 } }, title: "Senior Developer", country: "Philippines", streak: 8 },
    { _id: "lb29", contestId: "global", rank: 29, score: 13300, submissions: 802, penalty: 0, lastSubmissionAt: "2026-02-12T11:00:00.000Z", finalized: true, userId: { _id: "u29", name: "Closure Czar", username: "closure_czar", email: "closureczar@codearena.com", stats: { totalSubmissions: 802, score: 13300 } }, title: "Staff Engineer", country: "Egypt", streak: 8 },
    { _id: "lb30", contestId: "global", rank: 30, score: 13000, submissions: 784, penalty: 0, lastSubmissionAt: "2026-02-11T14:00:00.000Z", finalized: true, userId: { _id: "u30", name: "Scope Sage", username: "scope_sage", email: "scopesage@codearena.com", stats: { totalSubmissions: 784, score: 13000 } }, title: "Solutions Architect", country: "Chile", streak: 7 },

    { _id: "lb31", contestId: "global", rank: 31, score: 12700, submissions: 766, penalty: 0, lastSubmissionAt: "2026-02-11T13:00:00.000Z", finalized: true, userId: { _id: "u31", name: "Hoisting Hero", username: "hoisting_hero", email: "hoistinghero@codearena.com", stats: { totalSubmissions: 766, score: 12700 } }, title: "Lead Developer", country: "Colombia", streak: 7 },
    { _id: "lb32", contestId: "global", rank: 32, score: 12400, submissions: 748, penalty: 0, lastSubmissionAt: "2026-02-11T12:00:00.000Z", finalized: true, userId: { _id: "u32", name: "Prototype Prince", username: "prototype_prince", email: "protoprince@codearena.com", stats: { totalSubmissions: 748, score: 12400 } }, title: "Principal Engineer", country: "Peru", streak: 6 },
    { _id: "lb33", contestId: "global", rank: 33, score: 12100, submissions: 730, penalty: 0, lastSubmissionAt: "2026-02-11T11:00:00.000Z", finalized: true, userId: { _id: "u33", name: "This Titan", username: "this_titan", email: "thistitan@codearena.com", stats: { totalSubmissions: 730, score: 12100 } }, title: "Engineering Manager", country: "Portugal", streak: 6 },
    { _id: "lb34", contestId: "global", rank: 34, score: 11800, submissions: 712, penalty: 0, lastSubmissionAt: "2026-02-10T14:00:00.000Z", finalized: true, userId: { _id: "u34", name: "Arrow Ace", username: "arrow_ace", email: "arrowace@codearena.com", stats: { totalSubmissions: 712, score: 11800 } }, title: "Tech Lead", country: "Austria", streak: 6 },
    { _id: "lb35", contestId: "global", rank: 35, score: 11500, submissions: 694, penalty: 0, lastSubmissionAt: "2026-02-10T13:00:00.000Z", finalized: true, userId: { _id: "u35", name: "Spread Specialist", username: "spread_specialist", email: "spreadspec@codearena.com", stats: { totalSubmissions: 694, score: 11500 } }, title: "Senior Developer", country: "Belgium", streak: 5 },
    { _id: "lb36", contestId: "global", rank: 36, score: 11300, submissions: 682, penalty: 0, lastSubmissionAt: "2026-02-10T12:00:00.000Z", finalized: true, userId: { _id: "u36", name: "Rest Rockstar", username: "rest_rockstar", email: "restrockstar@codearena.com", stats: { totalSubmissions: 682, score: 11300 } }, title: "Staff Engineer", country: "Denmark", streak: 5 },
    { _id: "lb37", contestId: "global", rank: 37, score: 11000, submissions: 664, penalty: 0, lastSubmissionAt: "2026-02-10T11:00:00.000Z", finalized: true, userId: { _id: "u37", name: "Destructure Dev", username: "destructure_dev", email: "destructuredev@codearena.com", stats: { totalSubmissions: 664, score: 11000 } }, title: "Solutions Architect", country: "Finland", streak: 5 },
    { _id: "lb38", contestId: "global", rank: 38, score: 10800, submissions: 652, penalty: 0, lastSubmissionAt: "2026-02-09T14:00:00.000Z", finalized: true, userId: { _id: "u38", name: "Template Tsar", username: "template_tsar", email: "templatetsar@codearena.com", stats: { totalSubmissions: 652, score: 10800 } }, title: "Lead Developer", country: "Norway", streak: 4 },
    { _id: "lb39", contestId: "global", rank: 39, score: 10500, submissions: 634, penalty: 0, lastSubmissionAt: "2026-02-09T13:00:00.000Z", finalized: true, userId: { _id: "u39", name: "Map Mogul", username: "map_mogul", email: "mapmogul@codearena.com", stats: { totalSubmissions: 634, score: 10500 } }, title: "Principal Engineer", country: "Ireland", streak: 4 },
    { _id: "lb40", contestId: "global", rank: 40, score: 10300, submissions: 622, penalty: 0, lastSubmissionAt: "2026-02-09T12:00:00.000Z", finalized: true, userId: { _id: "u40", name: "Filter Fanatic", username: "filter_fanatic", email: "filterfanatic@codearena.com", stats: { totalSubmissions: 622, score: 10300 } }, title: "Engineering Manager", country: "New Zealand", streak: 4 },

    { _id: "lb41", contestId: "global", rank: 41, score: 10000, submissions: 604, penalty: 0, lastSubmissionAt: "2026-02-09T11:00:00.000Z", finalized: true, userId: { _id: "u41", name: "Reduce Ruler", username: "reduce_ruler", email: "reduceruler@codearena.com", stats: { totalSubmissions: 604, score: 10000 } }, title: "Tech Lead", country: "Greece", streak: 3 },
    { _id: "lb42", contestId: "global", rank: 42, score: 9800, submissions: 592, penalty: 0, lastSubmissionAt: "2026-02-08T14:00:00.000Z", finalized: true, userId: { _id: "u42", name: "ForEach Force", username: "forEach_force", email: "foreachforce@codearena.com", stats: { totalSubmissions: 592, score: 9800 } }, title: "Senior Developer", country: "Czech Republic", streak: 3 },
    { _id: "lb43", contestId: "global", rank: 43, score: 9500, submissions: 574, penalty: 0, lastSubmissionAt: "2026-02-08T13:00:00.000Z", finalized: true, userId: { _id: "u43", name: "Find Master", username: "find_master", email: "findmaster@codearena.com", stats: { totalSubmissions: 574, score: 9500 } }, title: "Staff Engineer", country: "Romania", streak: 3 },
    { _id: "lb44", contestId: "global", rank: 44, score: 9300, submissions: 562, penalty: 0, lastSubmissionAt: "2026-02-08T12:00:00.000Z", finalized: true, userId: { _id: "u44", name: "Some Savant", username: "some_savant", email: "somesavant@codearena.com", stats: { totalSubmissions: 562, score: 9300 } }, title: "Solutions Architect", country: "Hungary", streak: 2 },
    { _id: "lb45", contestId: "global", rank: 45, score: 9100, submissions: 550, penalty: 0, lastSubmissionAt: "2026-02-08T11:00:00.000Z", finalized: true, userId: { _id: "u45", name: "Every Emperor", username: "every_emperor", email: "everyemperor@codearena.com", stats: { totalSubmissions: 550, score: 9100 } }, title: "Lead Developer", country: "Ukraine", streak: 2 },
    { _id: "lb46", contestId: "global", rank: 46, score: 8900, submissions: 538, penalty: 0, lastSubmissionAt: "2026-02-07T14:00:00.000Z", finalized: true, userId: { _id: "u46", name: "Slice Sultan", username: "slice_sultan", email: "slicesultan@codearena.com", stats: { totalSubmissions: 538, score: 8900 } }, title: "Principal Engineer", country: "Pakistan", streak: 2 },
    { _id: "lb47", contestId: "global", rank: 47, score: 8700, submissions: 526, penalty: 0, lastSubmissionAt: "2026-02-07T13:00:00.000Z", finalized: true, userId: { _id: "u47", name: "Splice Sovereign", username: "splice_sovereign", email: "splicesovereign@codearena.com", stats: { totalSubmissions: 526, score: 8700 } }, title: "Engineering Manager", country: "Bangladesh", streak: 2 },
    { _id: "lb48", contestId: "global", rank: 48, score: 8500, submissions: 514, penalty: 0, lastSubmissionAt: "2026-02-07T12:00:00.000Z", finalized: true, userId: { _id: "u48", name: "Concat Commander", username: "concat_commander", email: "concatcommander@codearena.com", stats: { totalSubmissions: 514, score: 8500 } }, title: "Tech Lead", country: "Nigeria", streak: 1 },
    { _id: "lb49", contestId: "global", rank: 49, score: 8300, submissions: 502, penalty: 0, lastSubmissionAt: "2026-02-07T11:00:00.000Z", finalized: true, userId: { _id: "u49", name: "Join Genius", username: "join_genius", email: "joingenius@codearena.com", stats: { totalSubmissions: 502, score: 8300 } }, title: "Senior Developer", country: "Kenya", streak: 1 },
    { _id: "lb50", contestId: "global", rank: 50, score: 8100, submissions: 490, penalty: 0, lastSubmissionAt: "2026-02-06T14:00:00.000Z", finalized: true, userId: { _id: "u50", name: "Split Specialist", username: "split_specialist", email: "splitspecialist@codearena.com", stats: { totalSubmissions: 490, score: 8100 } }, title: "Staff Engineer", country: "South Africa", streak: 1 },
];
