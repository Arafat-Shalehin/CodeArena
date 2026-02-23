/**
 * Compare program output with expected output
 * Supports multiple comparison modes
 */

/**
 * Normalize string for comparison
 */
function normalizeString(str) {
    return str
        .trim()
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\s+$/gm, '') // Remove trailing spaces from each line
        .replace(/^\s+/gm, ''); // Remove leading spaces from each line
}

/**
 * Exact comparison (case-sensitive, whitespace matters)
 */
export function exactCompare(output, expected) {
    const normalizedOutput = normalizeString(output);
    const normalizedExpected = normalizeString(expected);

    return {
        isMatch: normalizedOutput === normalizedExpected,
        mode: 'exact',
    };
}

/**
 * Token comparison (split by whitespace, compare tokens)
 */
export function tokenCompare(output, expected) {
    const outputTokens = normalizeString(output)
        .split(/\s+/)
        .filter(t => t.length > 0);

    const expectedTokens = normalizeString(expected)
        .split(/\s+/)
        .filter(t => t.length > 0);

    if (outputTokens.length !== expectedTokens.length) {
        return {
            isMatch: false,
            mode: 'token',
            reason: `Token count mismatch: got ${outputTokens.length}, expected ${expectedTokens.length}`,
        };
    }

    for (let i = 0; i < outputTokens.length; i++) {
        if (outputTokens[i] !== expectedTokens[i]) {
            return {
                isMatch: false,
                mode: 'token',
                reason: `Token mismatch at position ${i}: got "${outputTokens[i]}", expected "${expectedTokens[i]}"`,
            };
        }
    }

    return {
        isMatch: true,
        mode: 'token',
    };
}

/**
 * Float comparison (for problems with floating-point answers)
 */
export function floatCompare(output, expected, epsilon = 1e-6) {
    const outputTokens = normalizeString(output)
        .split(/\s+/)
        .filter(t => t.length > 0);

    const expectedTokens = normalizeString(expected)
        .split(/\s+/)
        .filter(t => t.length > 0);

    if (outputTokens.length !== expectedTokens.length) {
        return {
            isMatch: false,
            mode: 'float',
            reason: 'Token count mismatch',
        };
    }

    for (let i = 0; i < outputTokens.length; i++) {
        const outNum = parseFloat(outputTokens[i]);
        const expNum = parseFloat(expectedTokens[i]);

        // If both are numbers, compare with epsilon
        if (!isNaN(outNum) && !isNaN(expNum)) {
            const diff = Math.abs(outNum - expNum);
            const maxVal = Math.max(Math.abs(outNum), Math.abs(expNum));

            // Relative error check
            if (diff > epsilon && diff / maxVal > epsilon) {
                return {
                    isMatch: false,
                    mode: 'float',
                    reason: `Float mismatch at position ${i}: difference ${diff} exceeds epsilon ${epsilon}`,
                };
            }
        } else if (outputTokens[i] !== expectedTokens[i]) {
            // Non-numeric tokens must match exactly
            return {
                isMatch: false,
                mode: 'float',
                reason: `String mismatch at position ${i}`,
            };
        }
    }

    return {
        isMatch: true,
        mode: 'float',
    };
}

/**
 * Line-by-line comparison
 */
export function lineCompare(output, expected) {
    const outputLines = normalizeString(output).split('\n').filter(l => l.length > 0);
    const expectedLines = normalizeString(expected).split('\n').filter(l => l.length > 0);

    if (outputLines.length !== expectedLines.length) {
        return {
            isMatch: false,
            mode: 'line',
            reason: `Line count mismatch: got ${outputLines.length}, expected ${expectedLines.length}`,
        };
    }

    for (let i = 0; i < outputLines.length; i++) {
        if (outputLines[i] !== expectedLines[i]) {
            return {
                isMatch: false,
                mode: 'line',
                reason: `Line mismatch at line ${i + 1}`,
                actualLine: outputLines[i],
                expectedLine: expectedLines[i],
            };
        }
    }

    return {
        isMatch: true,
        mode: 'line',
    };
}

/**
 * Custom comparison (uses custom checker function)
 */
export async function customCompare(output, expected, checkerCode) {
    try {
        // Execute custom checker (should return boolean)
        // This would require additional security measures
        const checker = new Function('output', 'expected', checkerCode);
        const result = checker(output, expected);

        return {
            isMatch: !!result,
            mode: 'custom',
        };
    } catch (error) {
        return {
            isMatch: false,
            mode: 'custom',
            error: error.message,
        };
    }
}

/**
 * Main comparison function - delegates to appropriate comparator
 */
export function compareOutputs(output, expected, mode = 'token', options = {}) {
    switch (mode.toLowerCase()) {
        case 'exact':
            return exactCompare(output, expected);

        case 'token':
            return tokenCompare(output, expected);

        case 'float':
            return floatCompare(output, expected, options.epsilon);

        case 'line':
            return lineCompare(output, expected);

        case 'custom':
            return customCompare(output, expected, options.checkerCode);

        default:
            return tokenCompare(output, expected);
    }
}
