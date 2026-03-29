import { User } from '@/models/User.models'
import { Problem } from '@/models/Problem.models'

/**
 * Detects weak tags for a user based on their performance stats with recency and volume weighting.
 * @param {Map} performanceStats - Map of tag strings to performance data.
 * @returns {Array<Object>} List of tags with their weakness scores, sorted by score.
 */
export function detectWeakTags(performanceStats) {
    if (!performanceStats || performanceStats.size === 0) return []

    const weakTags = []
    const now = new Date()
    const DECAY_RATE = 0.05 // Decay per day

    for (const [tag, stats] of performanceStats.entries()) {
        const { attempted, solved, failed, lastAttemptDate, recentSolveStreak = 0 } = stats

        if (attempted === 0) continue

        // Recency Decay: Older failures weigh less
        let recencyFactor = 1
        if (lastAttemptDate) {
            const daysSince = Math.max(0, (now - new Date(lastAttemptDate)) / (1000 * 60 * 60 * 24))
            recencyFactor = Math.exp(-DECAY_RATE * daysSince)
        }

        // Volume Weight: More attempts make the failure rate more significant
        const volumeWeight = Math.log2(attempted + 1)

        // Success Rate Penalty: (1 - successRate) = failure rate
        const successRate = solved / attempted
        const failureRate = 1 - successRate

        // Solve streak dampening: if user is on a solving streak for this tag, reduce weakness
        const streakDampener = 1 / (1 + recentSolveStreak * 0.3)

        // Final Weakness Score
        const weaknessScore = failureRate * volumeWeight * recencyFactor * streakDampener

        if (weaknessScore > 0) {
            weakTags.push({ tag, score: weaknessScore })
        }
    }

    // Sort by weakness score descending
    return weakTags.sort((a, b) => b.score - a.score)
}

/**
 * Determines the target difficulty for the user based on their distribution of solved problems.
 * @param {Object} stats - User stats object containing solvedDistribution.
 * @returns {string} The calculated target difficulty.
 */
export function calculateTargetDifficulty(stats) {
    const solvedDistribution = stats?.solvedDistribution || {}
    const totalSolved = stats?.accepted || 0
    const { easy = 0, medium = 0, hard = 0 } = solvedDistribution

    // Dynamic Leveling: Progressive thresholds
    if (totalSolved < 10 || easy < 10) return 'easy'
    if (totalSolved < 50 || medium < 20) return 'medium'
    return 'hard'
}

/**
 * Recommends problems based on user's weak tags and performance level using multi-signal ranking.
 * @param {string} userId - ID of the user.
 * @param {number} limit - Number of problems to recommend.
 * @returns {Promise<Object>} Object containing weak tags and recommended problems.
 */
export async function getRecommendedProblems(userId, limit = 6) {
    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')

    const weaknessList = detectWeakTags(user.performanceStats)
    const targetTags = weaknessList.slice(0, 5).map((w) => w.tag)
    const solvedProblemIds = user.stats?.solvedProblems || []

    // Determine user's target difficulty level
    const targetDifficulty = calculateTargetDifficulty(user.stats)

    // Build query for candidates (unsolved problems)
    const candidateLimit = Math.max(limit * 5, 20)
    const query = {
        _id: { $nin: solvedProblemIds },
    }

    if (targetTags.length > 0) {
        query.tags = { $in: targetTags }
    }

    // Fetch candidate problems
    let candidates = await Problem.find(query).limit(candidateLimit).lean()

    // If too few candidates, widen the search to include any problem of target difficulty
    if (candidates.length < limit) {
        const additional = await Problem.find({
            _id: { $nin: [...solvedProblemIds, ...candidates.map((p) => p._id)] },
            difficulty: targetDifficulty,
        })
            .limit(candidateLimit - candidates.length)
            .lean()
        candidates = [...candidates, ...additional]
    }

    // Scoring & Ranking
    const scoredProblems = candidates.map((problem) => {
        let score = 0

        // 1. Tag Match Score (Max +50)
        const matchedWeakness = weaknessList.find((w) => problem.tags.includes(w.tag))
        if (matchedWeakness) {
            score += Math.min(50, matchedWeakness.score * 10)
        }

        // 2. Difficulty Match Score (+30)
        if (problem.difficulty === targetDifficulty) {
            score += 30
        } else if (
            (targetDifficulty === 'medium' && problem.difficulty === 'easy') ||
            (targetDifficulty === 'hard' && problem.difficulty === 'medium')
        ) {
            score += 15
        }

        // 3. Quality Score: Acceptance Rate (Max +20)
        const accRate =
            problem.totalSubmissions > 0
                ? (problem.acceptedSubmissions / problem.totalSubmissions) * 100
                : 50

        if (accRate >= 30 && accRate <= 70) score += 20
        else if (accRate > 70) score += 10
        else score += 5

        // 4. Popularity Score (Max +10)
        const popularity = Math.log10((problem.totalSubmissions || 0) + 1)
        score += Math.min(10, popularity * 2)

        let reason = ''
        if (matchedWeakness) {
            reason = `Strengthen your skills in ${matchedWeakness.tag}`
        } else if (problem.difficulty === targetDifficulty) {
            reason = `Perfect for your current ${targetDifficulty} level`
        } else {
            reason = 'Discover new topics and broaden your knowledge'
        }

        return { ...problem, relevanceScore: score, reason }
    })

    const recommendations = scoredProblems
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit)

    return {
        weakTags: targetTags,
        recommendations: recommendations,
        recommendedProblems: recommendations,
        userLevel: targetDifficulty,
    }
}

/**
 * Recommends "discovery" problems from tags the user hasn't tried yet.
 * @param {string} userId - ID of the user.
 * @param {number} limit - Number of tags and problems to discover.
 * @returns {Promise<Object>} Object containing discovery tags and problems.
 */
export async function getDiscoveryProblems(userId, limit = 3) {
    const user = await User.findById(userId).select('performanceStats stats.solvedProblems')
    if (!user) throw new Error('User not found')

    const triedTags = user.performanceStats ? Array.from(user.performanceStats.keys()) : []
    const solvedProblemIds = user.stats?.solvedProblems || []

    const allTags = await Problem.distinct('tags')
    const untouchedTags = allTags.filter((t) => !triedTags.includes(t))

    if (untouchedTags.length === 0) {
        return { discoveryTags: [], discoveryProblems: [] }
    }

    // Pick a few random untouched tags
    const discoveryTags = untouchedTags.sort(() => 0.5 - Math.random()).slice(0, limit)

    const discoveryProblems = await Problem.find({
        tags: { $in: discoveryTags },
        difficulty: 'easy',
        _id: { $nin: solvedProblemIds },
    })
        .select('title difficulty acceptanceRate tags totalSubmissions acceptedSubmissions')
        .sort({ acceptedSubmissions: -1 })
        .limit(limit)
        .lean()

    return {
        discoveryTags,
        discoveryProblems: discoveryProblems.map((p) => ({
            ...p,
            reason: `Explore new topic: ${p.tags.find((t) => discoveryTags.includes(t))}`,
        })),
    }
}
