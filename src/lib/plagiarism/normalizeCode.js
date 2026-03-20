/**
 * Normalizes code for plagiarism detection by stripping comments,
 * collapsing whitespace, and replacing identifiers/literals with placeholders.
 *
 * This is a pure function with no side effects.
 *
 * @param {string} code - The raw source code to normalize.
 * @returns {Object} { normalizedCode: string|null, tokenCount: number }
 */
export function normalizeCode(code) {
    if (!code) return { normalizedCode: null, tokenCount: 0 }

    let normalized = code

    // 1. Strip multi-line comments (/* */ and """ """)
    normalized = normalized.replace(/\/\*[\s\S]*?\*\/|"""[\s\S]*?"""/g, '')

    // 2. Strip single-line comments (// and #)
    normalized = normalized.replace(/\/\/.*|#.*/g, '')

    // 3. Remove string literals (replace with 'STR')
    normalized = normalized.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, ' STR ')

    // 4. Remove numeric literals (replace with 'NUM')
    normalized = normalized.replace(/\b\d+(\.\d+)?\b/g, ' NUM ')

    // 5. Replace all identifier names with a canonical placeholder
    // (matches words starting with letters or underscore, common for variable/func names)
    normalized = normalized.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, (match) => {
        // Keep some common keywords that might define structure (optional, but 'VAR' is requested)
        const keywords = [
            'if',
            'else',
            'for',
            'while',
            'return',
            'def',
            'function',
            'class',
            'import',
            'from',
        ]
        if (keywords.includes(match.toLowerCase())) return match.toLowerCase()
        return 'VAR'
    })

    // 6. Collapse all whitespace (tabs, newlines → single space)
    normalized = normalized.replace(/\s+/g, ' ').trim()

    // 7. Lowercase entire string
    normalized = normalized.toLowerCase()

    // Count tokens
    const tokens = normalized.split(' ').filter(Boolean)
    const tokenCount = tokens.length

    // If tokenCount < 20, return null for normalizedCode as per requirements
    if (tokenCount < 20) {
        return { normalizedCode: null, tokenCount }
    }

    return { normalizedCode: normalized, tokenCount }
}
