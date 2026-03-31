import { describe, it, expect } from 'vitest'
import { buildContextualRecommendations } from '@/services/recommendation-context.service'

function makeProblem(id, tags = ['arrays']) {
    return { _id: String(id), tags }
}

describe('Recommendation Context Split', () => {
    it('keeps feed recommendations disjoint from profile recommendations', () => {
        const recommendationPool = Array.from({ length: 12 }, (_, idx) =>
            makeProblem(idx + 1, [`tag-${idx + 1}`])
        )

        const profileResult = buildContextualRecommendations({
            context: 'profile',
            recommendationPool,
            discoveryPool: [],
            profileLimit: 6,
            feedLimit: 6,
            discoveryLimit: 3,
        })

        const feedResult = buildContextualRecommendations({
            context: 'feed',
            recommendationPool,
            discoveryPool: [],
            profileLimit: 6,
            feedLimit: 6,
            discoveryLimit: 3,
        })

        const profileIds = new Set(profileResult.recommendations.map((p) => String(p._id)))
        const overlap = feedResult.recommendations.filter((p) => profileIds.has(String(p._id)))

        expect(profileResult.recommendations).toHaveLength(6)
        expect(feedResult.recommendations).toHaveLength(6)
        expect(overlap).toHaveLength(0)
    })

    it('backfills feed recommendations from discovery without profile overlap', () => {
        const recommendationPool = Array.from({ length: 8 }, (_, idx) =>
            makeProblem(idx + 1, [`core-${idx + 1}`])
        )
        const discoveryPool = [makeProblem('d1', ['graph']), makeProblem('d2', ['dp'])]

        const feedResult = buildContextualRecommendations({
            context: 'feed',
            recommendationPool,
            discoveryPool,
            profileLimit: 6,
            feedLimit: 6,
            discoveryLimit: 3,
        })

        const profileIds = new Set(
            recommendationPool.slice(0, 6).map((problem) => String(problem._id))
        )
        const overlap = feedResult.recommendations.filter((p) => profileIds.has(String(p._id)))

        expect(feedResult.recommendations).toHaveLength(4)
        expect(feedResult.recommendations.some((p) => String(p._id) === 'd1')).toBe(true)
        expect(feedResult.recommendations.some((p) => String(p._id) === 'd2')).toBe(true)
        expect(overlap).toHaveLength(0)
    })
})
