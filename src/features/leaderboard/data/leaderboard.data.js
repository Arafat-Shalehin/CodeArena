/**
 * Leaderboard Mock Data
 * 
 * Contains realistic mock data for the global leaderboard.
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
 * Positions 1-3 are featured in the podium
 * Positions 4+ are shown in the rankings table
 */
export const leaderboardUsers = [
    // Top 3 - Featured in Podium
    { rank: 1, username: "CodeGod_99", title: "Supreme Architect", points: 31200, solved: 1842, location: "USA", streak: 127 },
    { rank: 2, username: "algo_master", title: "Elite Engineer", points: 29800, solved: 1753, location: "China", streak: 98 },
    { rank: 3, username: "bug_hunter", title: "Senior Developer", points: 28100, solved: 1690, location: "India", streak: 85 },

    // Ranks 4-50 - Shown in Table
    { rank: 4, username: "code_ninja", title: "Lead Developer", points: 26900, solved: 1580, location: "Japan", streak: 72 },
    { rank: 5, username: "debug_master", title: "Principal Engineer", points: 25800, solved: 1520, location: "Germany", streak: 64 },
    { rank: 6, username: "stack_overflow", title: "Tech Lead", points: 24700, solved: 1465, location: "UK", streak: 58 },
    { rank: 7, username: "binary_boss", title: "Solutions Architect", points: 23600, solved: 1410, location: "Canada", streak: 51 },
    { rank: 8, username: "syntax_king", title: "Staff Engineer", points: 22900, solved: 1380, location: "France", streak: 47 },
    { rank: 9, username: "loop_legend", title: "Senior Developer", points: 22100, solved: 1340, location: "Brazil", streak: 43 },
    { rank: 10, username: "data_wizard", title: "Engineering Manager", points: 21400, solved: 1298, location: "Australia", streak: 39 },

    { rank: 11, username: "refactor_guru", title: "Lead Developer", points: 20800, solved: 1256, location: "South Korea", streak: 36 },
    { rank: 12, username: "api_architect", title: "Principal Engineer", points: 20200, solved: 1220, location: "Netherlands", streak: 33 },
    { rank: 13, username: "thread_master", title: "Tech Lead", points: 19700, solved: 1189, location: "Sweden", streak: 30 },
    { rank: 14, username: "cache_hero", title: "Senior Developer", points: 19100, solved: 1154, location: "Singapore", streak: 28 },
    { rank: 15, username: "commit_champion", title: "Staff Engineer", points: 18600, solved: 1125, location: "Russia", streak: 25 },
    { rank: 16, username: "merge_master", title: "Solutions Architect", points: 18100, solved: 1092, location: "Spain", streak: 23 },
    { rank: 17, username: "push_pro", title: "Lead Developer", points: 17700, solved: 1067, location: "Italy", streak: 21 },
    { rank: 18, username: "pull_prodigy", title: "Principal Engineer", points: 17200, solved: 1038, location: "Poland", streak: 19 },
    { rank: 19, username: "branch_boss", title: "Engineering Manager", points: 16800, solved: 1015, location: "Mexico", streak: 17 },
    { rank: 20, username: "deploy_deity", title: "Tech Lead", points: 16400, solved: 989, location: "Argentina", streak: 16 },

    { rank: 21, username: "docker_don", title: "Senior Developer", points: 16000, solved: 967, location: "Turkey", streak: 14 },
    { rank: 22, username: "kube_king", title: "Staff Engineer", points: 15600, solved: 942, location: "Israel", streak: 13 },
    { rank: 23, username: "cloud_captain", title: "Solutions Architect", points: 15300, solved: 923, location: "UAE", streak: 12 },
    { rank: 24, username: "lambda_lord", title: "Lead Developer", points: 14900, solved: 898, location: "Indonesia", streak: 11 },
    { rank: 25, username: "async_ace", title: "Principal Engineer", points: 14600, solved: 879, location: "Vietnam", streak: 10 },
    { rank: 26, username: "promise_pro", title: "Engineering Manager", points: 14200, solved: 856, location: "Thailand", streak: 9 },
    { rank: 27, username: "callback_champ", title: "Tech Lead", points: 13900, solved: 838, location: "Malaysia", streak: 9 },
    { rank: 28, username: "event_expert", title: "Senior Developer", points: 13600, solved: 820, location: "Philippines", streak: 8 },
    { rank: 29, username: "closure_czar", title: "Staff Engineer", points: 13300, solved: 802, location: "Egypt", streak: 8 },
    { rank: 30, username: "scope_sage", title: "Solutions Architect", points: 13000, solved: 784, location: "Chile", streak: 7 },

    { rank: 31, username: "hoisting_hero", title: "Lead Developer", points: 12700, solved: 766, location: "Colombia", streak: 7 },
    { rank: 32, username: "prototype_prince", title: "Principal Engineer", points: 12400, solved: 748, location: "Peru", streak: 6 },
    { rank: 33, username: "this_titan", title: "Engineering Manager", points: 12100, solved: 730, location: "Portugal", streak: 6 },
    { rank: 34, username: "arrow_ace", title: "Tech Lead", points: 11800, solved: 712, location: "Austria", streak: 6 },
    { rank: 35, username: "spread_specialist", title: "Senior Developer", points: 11500, solved: 694, location: "Belgium", streak: 5 },
    { rank: 36, username: "rest_rockstar", title: "Staff Engineer", points: 11300, solved: 682, location: "Denmark", streak: 5 },
    { rank: 37, username: "destructure_dev", title: "Solutions Architect", points: 11000, solved: 664, location: "Finland", streak: 5 },
    { rank: 38, username: "template_tsar", title: "Lead Developer", points: 10800, solved: 652, location: "Norway", streak: 4 },
    { rank: 39, username: "map_mogul", title: "Principal Engineer", points: 10500, solved: 634, location: "Ireland", streak: 4 },
    { rank: 40, username: "filter_fanatic", title: "Engineering Manager", points: 10300, solved: 622, location: "New Zealand", streak: 4 },

    { rank: 41, username: "reduce_ruler", title: "Tech Lead", points: 10000, solved: 604, location: "Greece", streak: 3 },
    { rank: 42, username: "forEach_force", title: "Senior Developer", points: 9800, solved: 592, location: "Czech Republic", streak: 3 },
    { rank: 43, username: "find_master", title: "Staff Engineer", points: 9500, solved: 574, location: "Romania", streak: 3 },
    { rank: 44, username: "some_savant", title: "Solutions Architect", points: 9300, solved: 562, location: "Hungary", streak: 2 },
    { rank: 45, username: "every_emperor", title: "Lead Developer", points: 9100, solved: 550, location: "Ukraine", streak: 2 },
    { rank: 46, username: "slice_sultan", title: "Principal Engineer", points: 8900, solved: 538, location: "Pakistan", streak: 2 },
    { rank: 47, username: "splice_sovereign", title: "Engineering Manager", points: 8700, solved: 526, location: "Bangladesh", streak: 2 },
    { rank: 48, username: "concat_commander", title: "Tech Lead", points: 8500, solved: 514, location: "Nigeria", streak: 1 },
    { rank: 49, username: "join_genius", title: "Senior Developer", points: 8300, solved: 502, location: "Kenya", streak: 1 },
    { rank: 50, username: "split_specialist", title: "Staff Engineer", points: 8100, solved: 490, location: "South Africa", streak: 1 },
];
