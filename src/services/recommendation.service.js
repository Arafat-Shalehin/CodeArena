import mongoose from 'mongoose'
import { Submission } from '@/models/Submission.models'
import { User } from '@/models/User.models'
import { Problem } from '@/models/Problem.models'

export const recommendationService = {
    // Task 2: Implement Performance Stats Aggregation
    async updateUserPerformanceStats(userId) {
        if (!userId) return null

        const userIdObj = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId

        const stats = await Submission.aggregate([
            {
                $match: { userId: userIdObj, type: 'submit' },
            },
            {
                // Group by problemId to calculate per-problem attempts and verdict
                $group: {
                    _id: '$problemId',
                    attempts: { $sum: 1 },
                    // Check both ACCEPTED and accepted due to possible inconsistencies in existing data
                    isSolved: {
                        $max: { $cond: [{ $in: ['$verdict', ['ACCEPTED', 'accepted']] }, 1, 0] },
                    },
                    lastAttempt: { $max: '$createdAt' },
                    firstAttemptTime: { $first: '$createdAt' },
                    avgTimeSeconds: { $avg: '$executionTime' },
                },
            },
            {
                $lookup: {
                    from: 'problems',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'problem',
                },
            },
            {
                $unwind: '$problem',
            },
            {
                // Unwind tags to group by tag
                $unwind: { path: '$problem.tags', preserveNullAndEmptyArrays: false },
            },
            {
                $group: {
                    _id: '$problem.tags',
                    attempted: { $sum: 1 },
                    solved: { $sum: '$isSolved' },
                    failed: { $sum: { $cond: [{ $eq: ['$isSolved', 0] }, 1, 0] } },
                    totalAttempts: { $sum: '$attempts' },
                    avgAttempts: { $avg: '$attempts' },
                    avgTime: { $avg: '$avgTimeSeconds' },
                    lastAttemptDate: { $max: '$lastAttempt' },
                },
            },
        ])

        // Further formatting
        const performanceStats = {}
        for (const stat of stats) {
            const tag = stat._id.toLowerCase()
            performanceStats[tag] = {
                attempted: stat.attempted || 0,
                solved: stat.solved || 0,
                failed: stat.failed || 0,
                uniqueProblems: stat.attempted || 0, // In this group, each document was a unique problem before unwind
                avgTime: stat.avgTime || 0,
                avgAttempts: stat.avgAttempts || 0,
                firstAttemptSuccessRate: 0,
                accuracyTrend: 'stable',
                lastAttemptDate: stat.lastAttemptDate,
                recentSolveStreak: 0,
            }
        }

        // Update User Model
        await User.findByIdAndUpdate(userIdObj, {
            $set: { performanceStats },
        })

        return performanceStats
    },

    // Task 3: Develop Weakness Detection Logic
    calculateWeaknessScore(tag, stats) {
        const { attempted = 0, solved = 0, lastAttemptDate, recentSolveStreak = 0 } = stats

        if (attempted === 0) return 0

        const failureRate = (attempted - solved) / attempted
        const volumeWeight = Math.log2(attempted + 1)

        const daysSince = lastAttemptDate
            ? Math.max(
                  0,
                  (Date.now() - new Date(lastAttemptDate).getTime()) / (1000 * 60 * 60 * 24)
              )
            : 0
        const recencyFactor = Math.exp(-0.05 * daysSince)

        const streakDampener = 1 / (1 + recentSolveStreak * 0.3)

        return failureRate * volumeWeight * recencyFactor * streakDampener
    },

    getUserWeakTags(performanceStats) {
        if (!performanceStats || typeof performanceStats !== 'object') return []

        const weakTags = []
        for (const [tag, stats] of Object.entries(performanceStats)) {
            // Convert to simple JS object if it's a Mongoose map
            const normalizedStats = typeof stats.toJSON === 'function' ? stats.toJSON() : stats
            const score = this.calculateWeaknessScore(tag, normalizedStats)
            weakTags.push({ tag, score, stats: normalizedStats })
        }

        // Sort by weakness score descending
        return weakTags.sort((a, b) => b.score - a.score)
    },

    // Task 4: Implement User Skill Leveling
    calculateUserLevel(solvedDistribution, totalSolved) {
        const easy = solvedDistribution?.easy || 0
        const medium = solvedDistribution?.medium || 0
        const hard = solvedDistribution?.hard || 0

        if (totalSolved < 10 || easy < 10) return 'easy'
        if (totalSolved < 50 || medium < 20) return 'medium'
        if (hard >= 10) return 'hard'
        return 'medium'
    },

    // Task 6: Implement Multi-Signal Ranking Pipeline
    calculateRecommendationScore(problem, userWeakTags, userLevel, userStats) {
        let score = 0

        // 1. Weakness Match (50%)
        const matchedWeakness = userWeakTags.find((w) =>
            problem.tags.some((t) => t.toLowerCase() === w.tag.toLowerCase())
        )
        const weaknessScore = matchedWeakness ? Math.min(100, matchedWeakness.score * 20) : 0
        score += weaknessScore * 0.5

        // 2. Difficulty Match (30%)
        const difficultyMatch = {
            easy: { easy: 100, medium: 30, hard: 0 },
            medium: { easy: 30, medium: 100, hard: 50 },
            hard: { easy: 0, medium: 50, hard: 100 },
        }
        const diffScore = difficultyMatch[userLevel]?.[problem.difficulty] || 0
        score += diffScore * 0.3

        // 3. Quality Signal (10%)
        const accRate =
            problem.totalSubmissions > 0
                ? (problem.acceptedSubmissions / problem.totalSubmissions) * 100
                : 50
        let qualityScore = 0
        if (accRate >= 30 && accRate <= 70) qualityScore = 100
        else if (accRate > 70) qualityScore = 50
        else qualityScore = 30
        score += qualityScore * 0.1

        // 4. Popularity (10%)
        const popularity = Math.log10((problem.totalSubmissions || 0) + 1)
        const popularityScore = Math.min(100, popularity * 15)
        score += popularityScore * 0.1

        // 5. Diversity Bonus
        const attemptedTags = userStats?.attemptedTags || []
        const userTags = new Set(attemptedTags.map((t) => t.toLowerCase()))
        const isNewTag = problem.tags.some((t) => !userTags.has(t.toLowerCase()))
        if (isNewTag) score += 10

        return Math.min(100, score)
    },

    // Task 5: Build Discovery Algorithm
    async getDiscoveryProblems(userId, limit = 3) {
        const userIdObj = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId
        const user = await User.findById(userIdObj).lean()
        if (!user) return []

        const performanceStats = user.performanceStats || {}
        const attemptedTags = new Set(Object.keys(performanceStats).map((t) => t.toLowerCase()))

        // Get all distinct tags
        const allTagsRaw = await Problem.distinct('tags')
        const allTags = allTagsRaw.map((t) => t.toLowerCase())
        const untouchedTags = allTags.filter((t) => !attemptedTags.has(t))

        if (untouchedTags.length === 0) return []

        // Select random untouched tags
        const selectedTags = [...untouchedTags].sort(() => 0.5 - Math.random()).slice(0, limit)

        // Recommend easy problems in those tags
        const solvedProblemIds = user.stats?.solvedProblems || []

        const discoveryProblems = await Problem.find({
            tags: { $in: selectedTags.map((t) => new RegExp(`^${t}$`, 'i')) },
            difficulty: 'easy',
            _id: { $nin: solvedProblemIds },
        })
            .sort({ acceptedSubmissions: -1 })
            .limit(limit)
            .lean()

        return discoveryProblems.map((p, i) => ({
            ...p,
            reason: `Explore new topic: ${p.tags.find((t) => selectedTags.includes(t.toLowerCase())) || selectedTags[0]}`,
            isDiscovery: true,
        }))
    },

    // Main Recommendation Pipeline
    async getRecommendations(userId, limit = 6) {
        const userIdObj = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId
        const user = await User.findById(userIdObj).lean()
        if (!user) return []

        const perfStats = user.performanceStats || {}
        const weakTags = this.getUserWeakTags(perfStats)

        const totalSolved = user.stats?.accepted || 0
        const userLevel = this.calculateUserLevel(user.stats?.solvedDistribution, totalSolved)

        // Attempted Tags
        const attemptedTags = Object.keys(perfStats)

        const solvedProblemIds = user.stats?.solvedProblems || []

        const candidates = await Problem.find({
            _id: { $nin: solvedProblemIds },
        })
            .limit(100)
            .lean()

        const scoredProblems = candidates.map((p) => ({
            ...p,
            recommendationScore: this.calculateRecommendationScore(p, weakTags, userLevel, {
                attemptedTags,
            }),
        }))

        // Apply Diversity Constraint
        const finalRecommendations = []
        const usedTags = new Set()

        const sorted = scoredProblems.sort((a, b) => b.recommendationScore - a.recommendationScore)

        for (const problem of sorted) {
            if (finalRecommendations.length >= limit) break

            const newTags = problem.tags.filter((t) => !usedTags.has(t.toLowerCase()))

            if (newTags.length > 0 || finalRecommendations.length < Math.ceil(limit * 0.3)) {
                finalRecommendations.push(problem)
                problem.tags.forEach((t) => usedTags.add(t.toLowerCase()))
            }
        }

        if (finalRecommendations.length < limit) {
            const discovery = await this.getDiscoveryProblems(
                userId,
                limit - finalRecommendations.length
            )
            finalRecommendations.push(...discovery)
        }

        return finalRecommendations
    },
}
