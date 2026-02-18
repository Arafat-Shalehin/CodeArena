import { runAllTests, runMultipleTests } from './testRunner.js';
import { VERDICTS, getVerdict } from './verdicts.js';

/**
 * Main judge function - orchestrates code evaluation
 */
export async function judgeSubmission({
    code,
    language,
    problemId,
    testCases,
    timeLimit,
    memoryLimit,
    comparisonMode = 'token',
    onProgress,
}) {
    try {
        // Separate public and hidden test cases
        const publicTests = testCases.filter(tc => !tc.isHidden);
        const hiddenTests = testCases.filter(tc => tc.isHidden);

        // Report judging started
        if (onProgress) {
            onProgress({
                status: 'JUDGING',
                message: 'Starting evaluation...',
                progress: 0,
            });
        }

        // Run all tests
        const result = await runAllTests({
            code,
            language,
            publicTests,
            hiddenTests,
            timeLimit,
            memoryLimit,
            comparisonMode,
        });

        // Report completion
        if (onProgress) {
            onProgress({
                status: result.verdict,
                message: 'Evaluation complete',
                progress: 100,
            });
        }

        // Prepare final result
        return {
            verdict: result.verdict,
            verdictDetails: getVerdict(result.verdict),
            passed: result.passed,
            score: result.passed ? 100 : 0,
            publicTests: {
                passed: result.publicTestsResults.stats.passedTests,
                total: result.publicTestsResults.stats.totalTests,
                results: result.publicTestsResults.results.map(filterTestResult),
            },
            hiddenTests: result.hiddenTestsResults ? {
                passed: result.hiddenTestsResults.stats.passedTests,
                total: result.hiddenTestsResults.stats.totalTests,
                // Don't expose detailed results for hidden tests (only pass/fail)
                results: result.hiddenTestsResults.results.map(r => ({
                    testCaseNumber: r.testCaseNumber,
                    passed: r.passed,
                    verdict: r.verdict,
                })),
            } : null,
            stats: result.stats,
        };

    } catch (error) {
        console.error('Judge error:', error);
        return {
            verdict: 'SYSTEM_ERROR',
            verdictDetails: VERDICTS.SYSTEM_ERROR,
            passed: false,
            score: 0,
            error: error.message,
        };
    }
}

/**
 * Quick judge - only runs public test cases (for testing during problem solving)
 */
export async function quickJudge({
    code,
    language,
    testCases,
    timeLimit,
    memoryLimit,
    comparisonMode = 'token',
}) {
    try {
        const result = await runMultipleTests({
            code,
            language,
            testCases,
            timeLimit,
            memoryLimit,
            comparisonMode,
            stopOnFirstFailure: false,
        });

        return {
            verdict: result.verdict,
            verdictDetails: getVerdict(result.verdict),
            passed: result.passed,
            results: result.results.map(filterTestResult),
            stats: result.stats,
        };

    } catch (error) {
        console.error('Quick judge error:', error);
        return {
            verdict: 'SYSTEM_ERROR',
            verdictDetails: VERDICTS.SYSTEM_ERROR,
            error: error.message,
        };
    }
}

/**
 * Filter test result to remove sensitive information
 */
function filterTestResult(result) {
    return {
        testCaseNumber: result.testCaseNumber,
        verdict: result.verdict,
        passed: result.passed,
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
        error: result.error,
        actualOutput: result.actualOutput,
        testCase: result.testCase,
        comparisonDetails: result.comparisonDetails,
    };
}

/**
 * Validate submission before judging
 */
export function validateSubmission({ code, language, problemId }) {
    const errors = [];

    if (!code || code.trim().length === 0) {
        errors.push('Code cannot be empty');
    }

    if (code.length > 65536) {
        errors.push('Code size exceeds maximum allowed size (64KB)');
    }

    if (!language) {
        errors.push('Language must be specified');
    }

    if (!problemId) {
        errors.push('Problem ID must be specified');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Calculate submission score based on test results
 */
export function calculateScore(results) {
    const totalTests = results.stats.totalTests;
    const passedTests = results.stats.totalPassedTests;

    if (totalTests === 0) return 0;

    const score = Math.floor((passedTests / totalTests) * 100);
    return score;
}
