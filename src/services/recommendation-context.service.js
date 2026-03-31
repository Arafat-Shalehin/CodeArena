export function buildContextualRecommendations({
    context,
    recommendationPool,
    discoveryPool,
    profileLimit = 6,
    feedLimit = 6,
    discoveryLimit = 3,
    userId = 'default',
}) {
    const safeRecommendationPool = recommendationPool || []
    const safeDiscoveryPool = discoveryPool || []
    const resolvedContext = context === 'feed' ? 'feed' : 'profile'

    const userSeed = String(userId)
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0)

    // Stable rotation avoids every user seeing the exact same top-N while keeping
    // profile/feed partitions deterministic for that user.
    const offset = safeRecommendationPool.length > 0 ? userSeed % safeRecommendationPool.length : 0
    const rotatedPool =
        offset === 0
            ? safeRecommendationPool
            : [...safeRecommendationPool.slice(offset), ...safeRecommendationPool.slice(0, offset)]

    const profileRecommendations = rotatedPool.slice(0, profileLimit)
    const profileIds = new Set(profileRecommendations.map((problem) => String(problem._id)))

    let recommendations = []
    const currentLimit = resolvedContext === 'feed' ? feedLimit : profileLimit

    if (resolvedContext === 'feed') {
        // Feed uses the same ranked pool but must be disjoint from profile.
        recommendations = rotatedPool
            .filter((problem) => !profileIds.has(String(problem._id)))
            .slice(0, feedLimit)
    } else {
        recommendations = profileRecommendations
    }

    // Backfill from the recommendation pool first.
    if (recommendations.length < currentLimit) {
        const currentIds = new Set(recommendations.map((p) => String(p._id)))
        const additional = rotatedPool
            .filter((problem) => {
                const id = String(problem._id)
                if (currentIds.has(id)) return false
                if (resolvedContext === 'feed' && profileIds.has(id)) return false
                return true
            })
            .slice(0, currentLimit - recommendations.length)

        recommendations = [...recommendations, ...additional]
    }

    // Backfill from discovery if still short.
    if (recommendations.length < currentLimit) {
        const currentIds = new Set(recommendations.map((p) => String(p._id)))
        const fallback = safeDiscoveryPool
            .filter((problem) => {
                const id = String(problem._id)
                if (currentIds.has(id)) return false
                if (resolvedContext === 'feed' && profileIds.has(id)) return false
                return true
            })
            .slice(0, currentLimit - recommendations.length)

        recommendations = [...recommendations, ...fallback]
    }

    const finalIds = new Set(recommendations.map((p) => String(p._id)))

    // Discovery remains distinct from profile and currently selected recommendations.
    const discoveryProblems = safeDiscoveryPool
        .filter((problem) => {
            const id = String(problem._id)
            return !profileIds.has(id) && !finalIds.has(id)
        })
        .slice(0, discoveryLimit)

    return {
        recommendations,
        discoveryProblems,
    }
}
