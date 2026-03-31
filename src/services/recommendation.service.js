import mongoose from 'mongoose'
import { User } from '@/models/User.models'
import { Problem } from '@/models/Problem.models'
import { Submission } from '@/models/Submission.models'

const ACCEPTED_VERDICTS = ['ACCEPTED', 'accepted']
const DAY_IN_MS = 1000 * 60 * 60 * 24

function normalizeMapObject(value) {
    if (!value || typeof value !== 'object') return {}
    return typeof value.toJSON === 'function' ? value.toJSON() : { ...value }
}

function clamp(value, min = 0, max = 1) {
    return Math.min(max, Math.max(min, value))
}

export const recommendationService = {
    async updateUserPerformanceStats(userId) {
        if (!userId) return null

        const userIdObj = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId

        // Step 1: Fetch submissions without $lookup (much faster)
        const submissions = await Submission.find({ userId: userIdObj, type: 'submit' })
            .select('problemId verdict createdAt executionTime')
            .sort({ createdAt: 1 })
            .lean()

        if (submissions.length === 0) {
            await User.findByIdAndUpdate(userIdObj, { $set: { performanceStats: {} } })
            return {}
        }

        // Step 2: Get unique problem IDs and fetch problems ONCE
        const problemIds = [...new Set(submissions.map((s) => s.problemId.toString()))]
        const problems = await Problem.find({ _id: { $in: problemIds } })
            .select('_id tags')
            .lean()

        // Step 3: Create problem map for quick lookup
        const problemMap = new Map(problems.map((p) => [p._id.toString(), p]))

        // Step 4: Process submissions in memory (replaces complex aggregation)
        const problemStats = new Map() // problemId -> { attempts, verdicts, isSolved, lastAttempt, avgTime }

        submissions.forEach((sub) => {
            const pId = sub.problemId.toString()
            const verdict = sub.verdict || ''
            const isAccepted = ACCEPTED_VERDICTS.includes(verdict)
            const createdAt = new Date(sub.createdAt)

            if (!problemStats.has(pId)) {
                problemStats.set(pId, {
                    attempts: 0,
                    verdicts: [],
                    isSolved: false,
                    lastAttempt: null,
                    avgTimeSeconds: 0,
                    timeSum: 0,
                })
            }

            const stats = problemStats.get(pId)
            stats.attempts++
            stats.verdicts.push(verdict)
            if (isAccepted) stats.isSolved = true
            stats.timeSum += sub.executionTime || 0
            if (!stats.lastAttempt || createdAt > stats.lastAttempt) {
                stats.lastAttempt = createdAt
            }
        })

        // Step 5: Calculate per-tag statistics
        const tagStats = {}

        problemStats.forEach((stats, pId) => {
            const problem = problemMap.get(pId)
            if (!problem || !problem.tags) return

            const now = Date.now()
            const thirtyDaysAgo = now - 30 * DAY_IN_MS
            const isSolved = stats.isSolved
            const solvedRecently =
                isSolved && stats.lastAttempt && stats.lastAttempt.getTime() > thirtyDaysAgo
            const attemptedRecently =
                stats.lastAttempt && stats.lastAttempt.getTime() > thirtyDaysAgo
            const firstVerdict = stats.verdicts[0]
            const solvedOnFirstAttempt =
                stats.attempts === 1 && ACCEPTED_VERDICTS.includes(firstVerdict) ? 1 : 0

            problem.tags.forEach((tag) => {
                const tagLower = tag.toLowerCase()
                if (!tagStats[tagLower]) {
                    tagStats[tagLower] = {
                        attempted: 0,
                        solved: 0,
                        failed: 0,
                        uniqueProblems: 0,
                        avgTime: 0,
                        avgAttempts: 0,
                        firstAttemptSuccessCount: 0,
                        recentSolvedCount: 0,
                        recentAttemptCount: 0,
                        lastAttemptDate: null,
                        timeSum: 0,
                        attemptsSum: 0,
                        problemCount: 0,
                    }
                }

                const ts = tagStats[tagLower]
                ts.attempted++
                if (isSolved) ts.solved++
                else ts.failed++
                ts.uniqueProblems++
                ts.timeSum += stats.avgTimeSeconds
                ts.attemptsSum += stats.attempts
                ts.firstAttemptSuccessCount += solvedOnFirstAttempt
                if (solvedRecently) ts.recentSolvedCount++
                if (attemptedRecently) ts.recentAttemptCount++
                if (!ts.lastAttemptDate || stats.lastAttempt > ts.lastAttemptDate) {
                    ts.lastAttemptDate = stats.lastAttempt
                }
                ts.problemCount++
            })
        })

        // Step 6: Finalize stats
        const performanceStats = {}
        for (const [tag, ts] of Object.entries(tagStats)) {
            const attempted = ts.attempted
            const recentAttemptCount = ts.recentAttemptCount || 0
            const recentSolvedCount = ts.recentSolvedCount || 0
            const overallAccuracy = attempted > 0 ? ts.solved / attempted : 0
            const recentAccuracy =
                recentAttemptCount > 0 ? recentSolvedCount / recentAttemptCount : overallAccuracy

            let accuracyTrend = 'stable'
            if (recentAccuracy > overallAccuracy + 0.1) accuracyTrend = 'improving'
            if (recentAccuracy < overallAccuracy - 0.1) accuracyTrend = 'declining'

            performanceStats[tag] = {
                attempted,
                solved: ts.solved || 0,
                failed: ts.failed || 0,
                uniqueProblems: ts.uniqueProblems || attempted,
                avgTime: ts.problemCount > 0 ? ts.timeSum / ts.problemCount : 0,
                avgAttempts: ts.problemCount > 0 ? ts.attemptsSum / ts.problemCount : 0,
                firstAttemptSuccessRate:
                    attempted > 0 ? ts.firstAttemptSuccessCount / attempted : 0,
                accuracyTrend,
                lastAttemptDate: ts.lastAttemptDate || null,
                recentSolveStreak: recentSolvedCount,
            }
        }

        await User.findByIdAndUpdate(userIdObj, { $set: { performanceStats } })
        return performanceStats
    },

    calculateWeaknessScore(tag, stats) {
        const {
            attempted = 0,
            solved = 0,
            avgAttempts = 0,
            firstAttemptSuccessRate = 0,
            lastAttemptDate,
            recentSolveStreak = 0,
            accuracyTrend = 'stable',
        } = stats

        if (attempted === 0) return 0

        const failureRate = clamp((attempted - solved) / attempted)
        const retryPenalty = clamp((avgAttempts - 1) / 3)
        const firstTryGap = clamp(1 - firstAttemptSuccessRate)
        const trendPenalty =
            accuracyTrend === 'declining' ? 0.2 : accuracyTrend === 'improving' ? -0.1 : 0
        const volumeWeight = clamp(Math.log2(attempted + 1) / 4)

        const daysSince = lastAttemptDate
            ? Math.max(0, (Date.now() - new Date(lastAttemptDate).getTime()) / DAY_IN_MS)
            : 365
        const recencyBoost = clamp(1 - daysSince / 90)
        const streakDampener = clamp(1 - recentSolveStreak / 10, 0.35, 1)

        return (
            (failureRate * 0.45 +
                retryPenalty * 0.2 +
                firstTryGap * 0.2 +
                recencyBoost * 0.1 +
                trendPenalty) *
            (0.7 + volumeWeight * 0.3) *
            streakDampener
        )
    },

    getUserWeakTags(performanceStats) {
        if (!performanceStats || typeof performanceStats !== 'object') return []

        return Object.entries(performanceStats)
            .map(([tag, stats]) => {
                const normalizedStats = normalizeMapObject(stats)
                return {
                    tag,
                    score: this.calculateWeaknessScore(tag, normalizedStats),
                    stats: normalizedStats,
                }
            })
            .sort((a, b) => b.score - a.score)
    },

    calculateUserLevel(solvedDistribution, totalSolved) {
        const easy = solvedDistribution?.easy || 0
        const medium = solvedDistribution?.medium || 0
        const hard = solvedDistribution?.hard || 0

        // Dynamic Leveling: Progressive thresholds
        if (totalSolved < 10 || easy < 10) return 'easy'
        if (totalSolved < 50 || medium < 20) return 'medium'
        return 'hard'
    },

    buildUserRecommendationProfile(user) {
        const perfStats = normalizeMapObject(user?.performanceStats)
        const weakTags = this.getUserWeakTags(perfStats)
        const totalSolved = user?.stats?.accepted || 0
        const userLevel = this.calculateUserLevel(user?.stats?.solvedDistribution, totalSolved)

        const attemptedTags = Object.keys(perfStats).map((tag) => tag.toLowerCase())
        const solvedProblemIds = new Set(
            (user?.stats?.solvedProblems || []).map((id) => String(id))
        )
        const attemptedProblemIds = new Set(
            (user?.stats?.attemptedProblems || []).map((id) => String(id))
        )

        return {
            perfStats,
            weakTags,
            userLevel,
            attemptedTags,
            attemptedTagSet: new Set(attemptedTags),
            solvedProblemIds,
            attemptedProblemIds,
        }
    },

    getDifficultyFit(problemDifficulty, userLevel, context = 'profile') {
        const difficultyMatch = {
            easy: { easy: 1, medium: 0.5, hard: 0.05 },
            medium: { easy: 0.55, medium: 1, hard: 0.65 },
            hard: { easy: 0.15, medium: 0.7, hard: 1 },
        }

        let fit = difficultyMatch[userLevel]?.[problemDifficulty] ?? 0.5
        if (context === 'profile' && problemDifficulty === 'hard' && userLevel !== 'hard') {
            fit *= 0.75
        }
        if (context === 'feed' && problemDifficulty === 'easy' && userLevel === 'hard') {
            fit *= 0.8
        }
        return clamp(fit)
    },

    scoreProblem(problem, profile, context = 'profile') {
        const tags = (problem.tags || []).map((tag) => String(tag).toLowerCase())
        const weakTagMatches = profile.weakTags.filter((entry) =>
            tags.includes(entry.tag.toLowerCase())
        )
        const strongestWeakness = weakTagMatches[0]

        const weaknessSignal = clamp((strongestWeakness?.score || 0) / 0.8)
        const noveltySignal = tags.some((tag) => !profile.attemptedTagSet.has(tag)) ? 1 : 0
        const recoverySignal = profile.attemptedProblemIds.has(String(problem._id)) ? 1 : 0
        const difficultySignal = this.getDifficultyFit(
            problem.difficulty,
            profile.userLevel,
            context
        )

        const acceptanceRate =
            problem.totalSubmissions > 0
                ? problem.acceptedSubmissions / problem.totalSubmissions
                : 0.5
        const qualitySignal = 1 - Math.abs(acceptanceRate - 0.55) / 0.55
        const popularitySignal = clamp(Math.log10((problem.totalSubmissions || 0) + 1) / 3)

        const daysSinceLastActivity = problem.lastSubmissionDate
            ? Math.max(0, (Date.now() - new Date(problem.lastSubmissionDate).getTime()) / DAY_IN_MS)
            : 365
        const freshnessSignal = clamp(1 - daysSinceLastActivity / 60)
        const trendSignal = clamp(
            Math.max(popularitySignal, clamp((problem.trendingScore || 0) / 100), freshnessSignal)
        )

        const weights =
            context === 'feed'
                ? {
                      weaknessSignal: 0.24,
                      noveltySignal: 0.24,
                      recoverySignal: 0.08,
                      difficultySignal: 0.16,
                      qualitySignal: 0.08,
                      trendSignal: 0.2,
                  }
                : context === 'problems'
                  ? {
                        weaknessSignal: 0.3,
                        noveltySignal: 0.12,
                        recoverySignal: 0.18,
                        difficultySignal: 0.2,
                        qualitySignal: 0.08,
                        trendSignal: 0.12,
                    }
                  : {
                        weaknessSignal: 0.42,
                        noveltySignal: 0.06,
                        recoverySignal: 0.18,
                        difficultySignal: 0.2,
                        qualitySignal: 0.08,
                        trendSignal: 0.06,
                    }

        const score =
            weaknessSignal * weights.weaknessSignal +
            noveltySignal * weights.noveltySignal +
            recoverySignal * weights.recoverySignal +
            difficultySignal * weights.difficultySignal +
            qualitySignal * weights.qualitySignal +
            trendSignal * weights.trendSignal

        let reason = 'Balanced next problem based on your recent activity.'
        if (context === 'profile' && strongestWeakness) {
            reason = `Skill-gap focus: ${strongestWeakness.tag}`
        } else if (context === 'feed' && noveltySignal) {
            reason = `Explore a fresh topic: ${tags[0] || 'new pattern'}`
        } else if (recoverySignal) {
            reason = 'Retry candidate based on your past attempts'
        } else if (context === 'problems' && strongestWeakness) {
            reason = `Recommended for ${strongestWeakness.tag} practice`
        }

        return {
            score: Number((score * 100).toFixed(2)),
            reason,
        }
    },

    rankProblemsForUser(
        user,
        problems,
        { context = 'profile', limit, excludeProblemIds = [] } = {}
    ) {
        if (!user || !Array.isArray(problems)) return []

        const profile = this.buildUserRecommendationProfile(user)
        const excluded = new Set(excludeProblemIds.map((id) => String(id)))

        const ranked = problems
            .filter((problem) => {
                const id = String(problem._id)
                return !profile.solvedProblemIds.has(id) && !excluded.has(id)
            })
            .map((problem) => {
                const { score, reason } = this.scoreProblem(problem, profile, context)
                return {
                    ...problem,
                    recommendationScore: score,
                    recommendationReason: reason,
                }
            })
            .sort((a, b) => {
                if (b.recommendationScore !== a.recommendationScore) {
                    return b.recommendationScore - a.recommendationScore
                }
                return (b.acceptedSubmissions || 0) - (a.acceptedSubmissions || 0)
            })

        return typeof limit === 'number' ? ranked.slice(0, limit) : ranked
    },

    async getDiscoveryProblems(userId, limit = 3, options = {}) {
        const userIdObj = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId
        const user =
            options.user || (await User.findById(userIdObj).select('stats performanceStats').lean())
        if (!user) return []

        const profile = this.buildUserRecommendationProfile(user)
        const allTagsRaw = await Problem.distinct('tags')
        const untouchedTags = allTagsRaw
            .map((tag) => String(tag).toLowerCase())
            .filter((tag) => !profile.attemptedTagSet.has(tag))

        if (untouchedTags.length === 0) return []

        const discoveryCandidates = await Problem.find({
            tags: { $in: untouchedTags.map((tag) => new RegExp(`^${tag}$`, 'i')) },
            _id: { $nin: Array.from(profile.solvedProblemIds) },
        })
            .sort({ acceptedSubmissions: -1, createdAt: -1 })
            .limit(Math.max(limit * 4, 12))
            .lean()

        return discoveryCandidates.slice(0, limit).map((problem) => {
            const matchingTag =
                (problem.tags || []).find((tag) =>
                    untouchedTags.includes(String(tag).toLowerCase())
                ) || problem.tags?.[0]

            return {
                ...problem,
                reason: `Explore new topic: ${matchingTag || 'new patterns'}`,
                recommendationReason: `Explore new topic: ${matchingTag || 'new patterns'}`,
                isDiscovery: true,
            }
        })
    },

    async getRecommendations(userId, limit = 6, options = {}) {
        const userIdObj = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId
        const user =
            options.user || (await User.findById(userIdObj).select('stats performanceStats').lean())
        if (!user) return []

        const candidateLimit = Math.max(limit * 8, 48)
        const solvedProblemIds = user.stats?.solvedProblems || []
        const candidates = await Problem.find({
            _id: { $nin: solvedProblemIds },
        })
            .sort({ totalSubmissions: -1, createdAt: -1 })
            .limit(candidateLimit)
            .lean()

        return this.rankProblemsForUser(user, candidates, {
            context: options.context || 'profile',
            limit,
            excludeProblemIds: options.excludeProblemIds || [],
        })
    },

    calculateRecommendationScore(problem, userWeakTags, userLevel, userStats) {
        const profile = {
            weakTags: userWeakTags || [],
            userLevel,
            attemptedTagSet: new Set(
                (userStats?.attemptedTags || []).map((tag) => tag.toLowerCase())
            ),
            attemptedProblemIds: new Set(
                (userStats?.attemptedProblemIds || []).map((id) => String(id))
            ),
            solvedProblemIds: new Set(),
        }

        return this.scoreProblem(problem, profile, userStats?.context || 'profile').score
    },
}

export async function getRecommendedProblems(userId, limit = 6, options = {}) {
    return recommendationService.getRecommendations(userId, limit, options)
}
