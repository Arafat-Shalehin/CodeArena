import { User } from '@/models/User.models'
import { Problem } from '@/models/Problem.models'

/**
 * Detects weak tags for a user based on their performance stats.
 * @param {Map} performanceStats - Map of tag strings to performance data.
 * @returns {Array<string>} List of weak tags.
 */
function detectWeakTags(performanceStats) {
    if (!performanceStats || performanceStats.size === 0) return []

    const weakTags = []

    for (const [tag, stats] of performanceStats.entries()) {
        const { attempted, solved, failed } = stats

        if (attempted === 0) continue

        const successRate = solved / attempted

        // Criteria: success rate < 50% OR many failed submissions (e.g. >= 2)
        if (successRate < 0.5 || failed >= 2) {
            weakTags.push(tag)
        }
    }

    return weakTags
}

/**
 * Recommends problems based on user's weak tags and performance level.
 * @param {string} userId - ID of the user.
 * @param {number} limit - Number of problems to recommend.
 * @returns {Promise<Object>} Object containing weak tags and recommended problems.
 */
export async function getRecommendedProblems(userId, limit = 6) {
    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')

    const weakTags = detectWeakTags(user.performanceStats)
    const solvedProblemIds = user.stats.solvedProblems || []

    // Identify target tags to focus on
    let targetTags = [...weakTags]

    // If no strong weaknesses, find tags with lowest success rates
    if (targetTags.length === 0 && user.performanceStats && user.performanceStats.size > 0) {
        targetTags = Array.from(user.performanceStats.entries())
            .sort((a, b) => {
                const rateA = a[1].solved / a[1].attempted || 1
                const rateB = b[1].solved / b[1].attempted || 1
                return rateA - rateB
            })
            .slice(0, 3)
            .map(([tag]) => tag)
    }

    // Determine user's current difficulty level
    // Heuristic: Based on total score or solved problem distribution
    const solvedProblems = await Problem.find({ _id: { $in: solvedProblemIds } })
    const diffCount = { easy: 0, medium: 0, hard: 0 }
    solvedProblems.forEach((p) => {
        if (diffCount[p.difficulty] !== undefined) diffCount[p.difficulty]++
    })

    let targetDifficulty = 'easy'
    if (diffCount.easy >= 5) targetDifficulty = 'medium'
    if (diffCount.medium >= 5) targetDifficulty = 'hard'

    // Build query
    const query = {
        _id: { $nin: solvedProblemIds },
    }

    if (targetTags.length > 0) {
        query.tags = { $in: targetTags }
    }

    // Attempt 1: Weak tags + target difficulty
    let recommendations = []
    const rawRecs1 = await Problem.find({ ...query, difficulty: targetDifficulty })
        .limit(limit)
        .lean()
    recommendations = rawRecs1.map((p) => ({
        ...p,
        reason: targetTags.some((t) => p.tags.includes(t))
            ? `Focus on your weak area: ${p.tags.find((t) => targetTags.includes(t))}`
            : `Challenge yourself with a ${targetDifficulty} problem`,
    }))

    // Attempt 2: Weak tags + any difficulty (if still room)
    if (recommendations.length < limit) {
        const remaining = limit - recommendations.length
        const rawRecs2 = await Problem.find({
            ...query,
            _id: { $nin: [...solvedProblemIds, ...recommendations.map((p) => p._id)] },
        })
            .limit(remaining)
            .lean()
        recommendations = [
            ...recommendations,
            ...rawRecs2.map((p) => ({
                ...p,
                reason: `Strengthen your skills in ${p.tags.find((t) => targetTags.includes(t)) || 'targeted topics'}`,
            })),
        ]
    }

    // Attempt 3: No weak tag restriction, just target difficulty (if still room)
    if (recommendations.length < limit) {
        const remaining = limit - recommendations.length
        const rawRecs3 = await Problem.find({
            _id: { $nin: [...solvedProblemIds, ...recommendations.map((p) => p._id)] },
            difficulty: targetDifficulty,
        })
            .limit(remaining)
            .lean()
        recommendations = [
            ...recommendations,
            ...rawRecs3.map((p) => ({
                ...p,
                reason: `Master ${targetDifficulty} level problems`,
            })),
        ]
    }

    // Attempt 4: Any unsolved problem (last resort)
    if (recommendations.length < limit) {
        const remaining = limit - recommendations.length
        const rawRecs4 = await Problem.find({
            _id: { $nin: [...solvedProblemIds, ...recommendations.map((p) => p._id)] },
        })
            .limit(remaining)
            .lean()
        recommendations = [
            ...recommendations,
            ...rawRecs4.map((p) => ({
                ...p,
                reason: 'Explore something new and expand your knowledge',
            })),
        ]
    }

    return {
        weakTags: targetTags,
        recommendedProblems: recommendations,
    }
}
