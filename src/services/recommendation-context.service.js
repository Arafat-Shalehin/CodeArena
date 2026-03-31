export function buildContextualRecommendations({
    context,
    recommendationPool,
    discoveryPool,
    profileLimit = 6,
    feedLimit = 6,
    discoveryLimit = 3,
}) {
    const safeRecommendationPool = recommendationPool || []
    const safeDiscoveryPool = discoveryPool || []
    const profileRecommendations = safeRecommendationPool.slice(0, profileLimit)
    const profileIds = new Set(profileRecommendations.map((problem) => String(problem._id)))

    let recommendations =
        context === 'feed'
            ? safeRecommendationPool
                  .slice(profileLimit)
                  .filter((problem) => !profileIds.has(String(problem._id)))
                  .slice(0, feedLimit)
            : profileRecommendations

    if (context === 'feed' && recommendations.length < feedLimit) {
        const recommendationIds = new Set(recommendations.map((problem) => String(problem._id)))
        const additional = safeDiscoveryPool.filter((problem) => {
            const id = String(problem._id)
            return !profileIds.has(id) && !recommendationIds.has(id)
        })
        recommendations = [...recommendations, ...additional].slice(0, feedLimit)
    }

    const recommendationIds = new Set(recommendations.map((problem) => String(problem._id)))
    const discoveryProblems = safeDiscoveryPool
        .filter((problem) => {
            const id = String(problem._id)
            return !profileIds.has(id) && !recommendationIds.has(id)
        })
        .slice(0, discoveryLimit)

    return {
        recommendations,
        discoveryProblems,
    }
}
