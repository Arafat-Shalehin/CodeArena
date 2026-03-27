import { describe, it, expect } from 'vitest'
import { recommendationService } from '@/services/recommendation.service'

describe('Recommendation Service - Phase 2', () => {
    describe('calculateWeaknessScore', () => {
        it('should return 0 when attempted is 0', () => {
            const score = recommendationService.calculateWeaknessScore('array', {
                attempted: 0,
                solved: 0,
            })
            expect(score).toBe(0)
        })

        it('should calculate higher score for higher failure rate', () => {
            const highFailure = recommendationService.calculateWeaknessScore('array', {
                attempted: 10,
                solved: 2,
            })
            const lowFailure = recommendationService.calculateWeaknessScore('array', {
                attempted: 10,
                solved: 8,
            })
            expect(highFailure).toBeGreaterThan(lowFailure)
        })

        it('should decay score over time (recency factor)', () => {
            const recent = recommendationService.calculateWeaknessScore('array', {
                attempted: 10,
                solved: 5,
                lastAttemptDate: new Date(),
            })
            const oldDate = new Date()
            oldDate.setDate(oldDate.getDate() - 30)
            const old = recommendationService.calculateWeaknessScore('array', {
                attempted: 10,
                solved: 5,
                lastAttemptDate: oldDate,
            })
            expect(recent).toBeGreaterThan(old)
        })
    })

    describe('getUserWeakTags', () => {
        it('should return sorted weak tags', () => {
            const stats = {
                math: { attempted: 10, solved: 2 }, // high weakness
                array: { attempted: 10, solved: 8 }, // low weakness
                'hash-table': { attempted: 0, solved: 0 }, // no weakness
            }
            const weakTags = recommendationService.getUserWeakTags(stats)

            expect(weakTags.length).toBe(3)
            expect(weakTags[0].tag).toBe('math')
            expect(weakTags[1].tag).toBe('array')
            expect(weakTags[2].tag).toBe('hash-table')
            expect(weakTags[2].score).toBe(0)
        })
    })

    describe('calculateUserLevel', () => {
        it('should return easy for beginners', () => {
            const level = recommendationService.calculateUserLevel({ easy: 5 }, 5)
            expect(level).toBe('easy')
        })

        it('should return medium for intermediate users', () => {
            const level = recommendationService.calculateUserLevel({ easy: 15, medium: 5 }, 20)
            expect(level).toBe('medium')
        })

        it('should return hard for advanced users', () => {
            const level = recommendationService.calculateUserLevel(
                { easy: 50, medium: 30, hard: 15 },
                95
            )
            expect(level).toBe('hard')
        })
    })

    describe('calculateRecommendationScore', () => {
        const weakTags = [{ tag: 'Dynamic Programming', score: 3.5 }]
        const userLevel = 'medium'
        const userStats = { attemptedTags: ['array'] }

        it('should boost score for matching weakness', () => {
            const problemMatch = {
                tags: ['Dynamic Programming'],
                difficulty: 'medium',
                totalSubmissions: 100,
                acceptedSubmissions: 50,
            }
            const problemNoMatch = {
                tags: ['Math'],
                difficulty: 'medium',
                totalSubmissions: 100,
                acceptedSubmissions: 50,
            }

            const scoreMatch = recommendationService.calculateRecommendationScore(
                problemMatch,
                weakTags,
                userLevel,
                userStats
            )
            const scoreNoMatch = recommendationService.calculateRecommendationScore(
                problemNoMatch,
                weakTags,
                userLevel,
                userStats
            )

            expect(scoreMatch).toBeGreaterThan(scoreNoMatch)
        })

        it('should boost score for matching difficulty', () => {
            const problemMatch = {
                tags: ['Tree'],
                difficulty: 'medium',
                totalSubmissions: 100,
                acceptedSubmissions: 50,
            }
            const problemNoMatch = {
                tags: ['Tree'],
                difficulty: 'hard',
                totalSubmissions: 100,
                acceptedSubmissions: 50,
            }

            const scoreMatch = recommendationService.calculateRecommendationScore(
                problemMatch,
                weakTags,
                userLevel,
                userStats
            )
            const scoreNoMatch = recommendationService.calculateRecommendationScore(
                problemNoMatch,
                weakTags,
                userLevel,
                userStats
            )

            expect(scoreMatch).toBeGreaterThan(scoreNoMatch)
        })

        it('should give diversity bonus for new tags', () => {
            const problemNewTag = {
                tags: ['Graph'],
                difficulty: 'medium',
                totalSubmissions: 100,
                acceptedSubmissions: 50,
            }
            const problemOldTag = {
                tags: ['Array'],
                difficulty: 'medium',
                totalSubmissions: 100,
                acceptedSubmissions: 50,
            }

            const scoreNew = recommendationService.calculateRecommendationScore(
                problemNewTag,
                [],
                userLevel,
                userStats
            )
            const scoreOld = recommendationService.calculateRecommendationScore(
                problemOldTag,
                [],
                userLevel,
                userStats
            )

            expect(scoreNew).toBeGreaterThan(scoreOld)
        })
    })
})
