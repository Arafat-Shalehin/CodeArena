import { describe, expect, it } from 'vitest'
import { recommendationService } from '@/services/recommendation.service'
import { recommendationCacheService } from '@/services/cache.service'

function makeProblem(
    id,
    {
        difficulty = 'medium',
        tags = ['arrays'],
        totalSubmissions = 100,
        acceptedSubmissions = 55,
        lastSubmissionDate = new Date().toISOString(),
        trendingScore = 20,
    } = {}
) {
    return {
        _id: String(id),
        title: `Problem ${id}`,
        difficulty,
        tags,
        totalSubmissions,
        acceptedSubmissions,
        lastSubmissionDate,
        trendingScore,
    }
}

describe('Recommendation Engine', () => {
    it('produces different ordering for profile and feed contexts', () => {
        const user = {
            stats: {
                accepted: 18,
                solvedProblems: [],
                attemptedProblems: ['2'],
                solvedDistribution: { easy: 10, medium: 7, hard: 1 },
            },
            performanceStats: {
                dp: {
                    attempted: 6,
                    solved: 2,
                    failed: 4,
                    avgAttempts: 2.6,
                    firstAttemptSuccessRate: 0.1,
                    lastAttemptDate: new Date().toISOString(),
                    recentSolveStreak: 0,
                    accuracyTrend: 'declining',
                },
                arrays: {
                    attempted: 8,
                    solved: 7,
                    failed: 1,
                    avgAttempts: 1.2,
                    firstAttemptSuccessRate: 0.7,
                    lastAttemptDate: new Date().toISOString(),
                    recentSolveStreak: 3,
                    accuracyTrend: 'improving',
                },
            },
        }

        const problems = [
            makeProblem('1', { tags: ['dp'], difficulty: 'medium', trendingScore: 10 }),
            makeProblem('2', { tags: ['dp'], difficulty: 'medium', trendingScore: 5 }),
            makeProblem('3', { tags: ['graphs'], difficulty: 'medium', trendingScore: 80 }),
            makeProblem('4', { tags: ['trees'], difficulty: 'easy', trendingScore: 90 }),
        ]

        const profileRanked = recommendationService.rankProblemsForUser(user, problems, {
            context: 'profile',
        })
        const feedRanked = recommendationService.rankProblemsForUser(user, problems, {
            context: 'feed',
        })

        const profileGraphs = profileRanked.find((problem) => problem._id === '3')
        const feedGraphs = feedRanked.find((problem) => problem._id === '3')

        expect(profileRanked[0].tags).toContain('dp')
        expect(feedGraphs.recommendationScore).toBeGreaterThan(profileGraphs.recommendationScore)
    })

    it('includes context in recommendation cache keys', () => {
        const userId = '507f1f77bcf86cd799439012'

        const profileKey = recommendationCacheService.generateKey(userId, {
            context: 'profile',
            limit: 6,
        })
        const feedKey = recommendationCacheService.generateKey(userId, {
            context: 'feed',
            limit: 6,
        })

        expect(profileKey).toContain('context:profile')
        expect(feedKey).toContain('context:feed')
        expect(feedKey).not.toBe(profileKey)
    })
})
