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
    { rank: 1, userId: "u1", username: "CodeGod_99", title: "Supreme Architect", score: 31200, solved: 1842, country: "USA", streak: 127 },
    { rank: 2, userId: "u2", username: "algo_master", title: "Elite Engineer", score: 29800, solved: 1753, country: "China", streak: 98 },
    { rank: 3, userId: "u3", username: "bug_hunter", title: "Senior Developer", score: 28100, solved: 1690, country: "India", streak: 85 },

    // Ranks 4-50 - Shown in Table
    // Ranks 4-50 - Shown in Table
    { rank: 4, userId: "u4", username: "code_ninja", title: "Lead Developer", score: 26900, solved: 1580, country: "Japan", streak: 72 },
    { rank: 5, userId: "u5", username: "debug_master", title: "Principal Engineer", score: 25800, solved: 1520, country: "Germany", streak: 64 },
    { rank: 6, userId: "u6", username: "stack_overflow", title: "Tech Lead", score: 24700, solved: 1465, country: "UK", streak: 58 },
    { rank: 7, userId: "u7", username: "binary_boss", title: "Solutions Architect", score: 23600, solved: 1410, country: "Canada", streak: 51 },
    { rank: 8, userId: "u8", username: "syntax_king", title: "Staff Engineer", score: 22900, solved: 1380, country: "France", streak: 47 },
    { rank: 9, userId: "u9", username: "loop_legend", title: "Senior Developer", score: 22100, solved: 1340, country: "Brazil", streak: 43 },
    { rank: 10, userId: "u10", username: "data_wizard", title: "Engineering Manager", score: 21400, solved: 1298, country: "Australia", streak: 39 },

    { rank: 11, userId: "u11", username: "refactor_guru", title: "Lead Developer", score: 20800, solved: 1256, country: "South Korea", streak: 36 },
    { rank: 12, userId: "u12", username: "api_architect", title: "Principal Engineer", score: 20200, solved: 1220, country: "Netherlands", streak: 33 },
    { rank: 13, userId: "u13", username: "thread_master", title: "Tech Lead", score: 19700, solved: 1189, country: "Sweden", streak: 30 },
    { rank: 14, userId: "u14", username: "cache_hero", title: "Senior Developer", score: 19100, solved: 1154, country: "Singapore", streak: 28 },
    { rank: 15, userId: "u15", username: "commit_champion", title: "Staff Engineer", score: 18600, solved: 1125, country: "Russia", streak: 25 },
    { rank: 16, userId: "u16", username: "merge_master", title: "Solutions Architect", score: 18100, solved: 1092, country: "Spain", streak: 23 },
    { rank: 17, userId: "u17", username: "push_pro", title: "Lead Developer", score: 17700, solved: 1067, country: "Italy", streak: 21 },
    { rank: 18, userId: "u18", username: "pull_prodigy", title: "Principal Engineer", score: 17200, solved: 1038, country: "Poland", streak: 19 },
    { rank: 19, userId: "u19", username: "branch_boss", title: "Engineering Manager", score: 16800, solved: 1015, country: "Mexico", streak: 17 },
    { rank: 20, userId: "u20", username: "deploy_deity", title: "Tech Lead", score: 16400, solved: 989, country: "Argentina", streak: 16 },

    { rank: 21, userId: "u21", username: "docker_don", title: "Senior Developer", score: 16000, solved: 967, country: "Turkey", streak: 14 },
    { rank: 22, userId: "u22", username: "kube_king", title: "Staff Engineer", score: 15600, solved: 942, country: "Israel", streak: 13 },
    { rank: 23, userId: "u23", username: "cloud_captain", title: "Solutions Architect", score: 15300, solved: 923, country: "UAE", streak: 12 },
    { rank: 24, userId: "u24", username: "lambda_lord", title: "Lead Developer", score: 14900, solved: 898, country: "Indonesia", streak: 11 },
    { rank: 25, userId: "u25", username: "async_ace", title: "Principal Engineer", score: 14600, solved: 879, country: "Vietnam", streak: 10 },
    { rank: 26, userId: "u26", username: "promise_pro", title: "Engineering Manager", score: 14200, solved: 856, country: "Thailand", streak: 9 },
    { rank: 27, userId: "u27", username: "callback_champ", title: "Tech Lead", score: 13900, solved: 838, country: "Malaysia", streak: 9 },
    { rank: 28, userId: "u28", username: "event_expert", title: "Senior Developer", score: 13600, solved: 820, country: "Philippines", streak: 8 },
    { rank: 29, userId: "u29", username: "closure_czar", title: "Staff Engineer", score: 13300, solved: 802, country: "Egypt", streak: 8 },
    { rank: 30, userId: "u30", username: "scope_sage", title: "Solutions Architect", score: 13000, solved: 784, country: "Chile", streak: 7 },

    { rank: 31, userId: "u31", username: "hoisting_hero", title: "Lead Developer", score: 12700, solved: 766, country: "Colombia", streak: 7 },
    { rank: 32, userId: "u32", username: "prototype_prince", title: "Principal Engineer", score: 12400, solved: 748, country: "Peru", streak: 6 },
    { rank: 33, userId: "u33", username: "this_titan", title: "Engineering Manager", score: 12100, solved: 730, country: "Portugal", streak: 6 },
    { rank: 34, userId: "u34", username: "arrow_ace", title: "Tech Lead", score: 11800, solved: 712, country: "Austria", streak: 6 },
    { rank: 35, userId: "u35", username: "spread_specialist", title: "Senior Developer", score: 11500, solved: 694, country: "Belgium", streak: 5 },
    { rank: 36, userId: "u36", username: "rest_rockstar", title: "Staff Engineer", score: 11300, solved: 682, country: "Denmark", streak: 5 },
    { rank: 37, userId: "u37", username: "destructure_dev", title: "Solutions Architect", score: 11000, solved: 664, country: "Finland", streak: 5 },
    { rank: 38, userId: "u38", username: "template_tsar", title: "Lead Developer", score: 10800, solved: 652, country: "Norway", streak: 4 },
    { rank: 39, userId: "u39", username: "map_mogul", title: "Principal Engineer", score: 10500, solved: 634, country: "Ireland", streak: 4 },
    { rank: 40, userId: "u40", username: "filter_fanatic", title: "Engineering Manager", score: 10300, solved: 622, country: "New Zealand", streak: 4 },

    { rank: 41, userId: "u41", username: "reduce_ruler", title: "Tech Lead", score: 10000, solved: 604, country: "Greece", streak: 3 },
    { rank: 42, userId: "u42", username: "forEach_force", title: "Senior Developer", score: 9800, solved: 592, country: "Czech Republic", streak: 3 },
    { rank: 43, userId: "u43", username: "find_master", title: "Staff Engineer", score: 9500, solved: 574, country: "Romania", streak: 3 },
    { rank: 44, userId: "u44", username: "some_savant", title: "Solutions Architect", score: 9300, solved: 562, country: "Hungary", streak: 2 },
    { rank: 45, userId: "u45", username: "every_emperor", title: "Lead Developer", score: 9100, solved: 550, country: "Ukraine", streak: 2 },
    { rank: 46, userId: "u46", username: "slice_sultan", title: "Principal Engineer", score: 8900, solved: 538, country: "Pakistan", streak: 2 },
    { rank: 47, userId: "u47", username: "splice_sovereign", title: "Engineering Manager", score: 8700, solved: 526, country: "Bangladesh", streak: 2 },
    { rank: 48, userId: "u48", username: "concat_commander", title: "Tech Lead", score: 8500, solved: 514, country: "Nigeria", streak: 1 },
    { rank: 49, userId: "u49", username: "join_genius", title: "Senior Developer", score: 8300, solved: 502, country: "Kenya", streak: 1 },
    { rank: 50, userId: "u50", username: "split_specialist", title: "Staff Engineer", score: 8100, solved: 490, country: "South Africa", streak: 1 },
];
