/**
 * Calculates the Jaccard Similarity between two normalized code strings.
 * Higher value (0-1) indicates higher similarity.
 *
 * @param {string} codeA - First normalized code string.
 * @param {string} codeB - Second normalized code string.
 * @returns {number} Similarity score between 0 and 1.
 */
export function jaccardSimilarity(codeA, codeB) {
    if (!codeA || !codeB) return 0

    // Tokenize strings by space
    const tokensA = codeA.split(' ').filter(Boolean)
    const tokensB = codeB.split(' ').filter(Boolean)

    if (tokensA.length === 0 || tokensB.length === 0) return 0

    const setA = new Set(tokensA)
    const setB = new Set(tokensB)

    // Calculate intersection
    const intersection = [...setA].filter((x) => setB.has(x)).length

    // Calculate union
    const union = new Set([...setA, ...setB]).size

    return union === 0 ? 0 : intersection / union
}
