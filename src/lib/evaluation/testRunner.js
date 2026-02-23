import { executeCode } from '../docker/executor.js'
import { compareOutputs } from './comparator.js'
import { VERDICTS } from './verdicts.js'

/**
 * Run code against a single test case
 */
export async function runSingleTest({
    code,
    language,
    testCase,
    timeLimit,
    memoryLimit,
    comparisonMode = 'token',
}) {
    try {
        // Execute code with test input
        const executionResult = await executeCode({
            code,
            language,
            input: testCase.input,
            timeLimit,
            memoryLimit,
        })

        // If execution failed, return the error verdict
        if (!executionResult.success) {
            return {
                verdict: executionResult.verdict,
                passed: false,
                executionTime: executionResult.executionTime || 0,
                memoryUsed: executionResult.memoryUsed || 0,
                error: executionResult.error,
                testCase: {
                    input: testCase.input.substring(0, 100),
                    expectedOutput: testCase.output.substring(0, 100),
                },
            }
        }

        // Compare output with expected output
        const comparisonResult = compareOutputs(
            executionResult.output,
            testCase.output,
            comparisonMode
        )

        return {
            verdict: comparisonResult.isMatch ? 'ACCEPTED' : 'WRONG_ANSWER',
            passed: comparisonResult.isMatch,
            executionTime: executionResult.executionTime,
            memoryUsed: executionResult.memoryUsed,
            actualOutput: executionResult.output.substring(0, 1000),
            testCase: {
                input: testCase.input.substring(0, 100),
                expectedOutput: testCase.output.substring(0, 100),
            },
            comparisonDetails: comparisonResult.reason,
        }
    } catch (error) {
        console.error('Test execution error:', error)
        return {
            verdict: 'SYSTEM_ERROR',
            passed: false,
            error: error.message,
        }
    }
}

/**
 * Run code against multiple test cases
 */
export async function runMultipleTests({
    code,
    language,
    testCases,
    timeLimit,
    memoryLimit,
    comparisonMode = 'token',
    stopOnFirstFailure = false,
}) {
    const results = []
    let totalExecutionTime = 0
    let maxMemoryUsed = 0

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i]

        const result = await runSingleTest({
            code,
            language,
            testCase,
            timeLimit,
            memoryLimit,
            comparisonMode,
        })

        result.testCaseNumber = i + 1
        result.testCaseId = testCase.id
        result.isHidden = testCase.isHidden || false

        results.push(result)

        totalExecutionTime += result.executionTime || 0
        maxMemoryUsed = Math.max(maxMemoryUsed, result.memoryUsed || 0)

        // Stop on first failure if requested (useful for quick feedback)
        if (stopOnFirstFailure && !result.passed) {
            break
        }
    }

    // Determine overall verdict
    const failedTest = results.find((r) => !r.passed)
    const overallVerdict = failedTest ? failedTest.verdict : 'ACCEPTED'

    // Calculate pass statistics
    const passedCount = results.filter((r) => r.passed).length
    const totalCount = results.length

    return {
        verdict: overallVerdict,
        passed: overallVerdict === 'ACCEPTED',
        results,
        stats: {
            passedTests: passedCount,
            totalTests: totalCount,
            totalExecutionTime,
            maxMemoryUsed,
        },
    }
}

/**
 * Run code against both public and hidden test cases
 */
export async function runAllTests({
    code,
    language,
    publicTests,
    hiddenTests,
    timeLimit,
    memoryLimit,
    comparisonMode = 'token',
}) {
    // First run public test cases
    const publicResults = await runMultipleTests({
        code,
        language,
        testCases: publicTests,
        timeLimit,
        memoryLimit,
        comparisonMode,
        stopOnFirstFailure: false,
    })

    // If public tests failed, don't run hidden tests
    if (!publicResults.passed) {
        return {
            ...publicResults,
            hiddenTestsResults: null,
            publicTestsPassed: false,
        }
    }

    // Run hidden test cases
    const hiddenResults = await runMultipleTests({
        code,
        language,
        testCases: hiddenTests,
        timeLimit,
        memoryLimit,
        comparisonMode,
        stopOnFirstFailure: false,
    })

    // Combine results
    return {
        verdict: hiddenResults.verdict,
        passed: hiddenResults.passed,
        publicTestsResults: publicResults,
        hiddenTestsResults: hiddenResults,
        publicTestsPassed: publicResults.passed,
        stats: {
            totalPassedTests: publicResults.stats.passedTests + hiddenResults.stats.passedTests,
            totalTests: publicResults.stats.totalTests + hiddenResults.stats.totalTests,
            totalExecutionTime:
                publicResults.stats.totalExecutionTime + hiddenResults.stats.totalExecutionTime,
            maxMemoryUsed: Math.max(
                publicResults.stats.maxMemoryUsed,
                hiddenResults.stats.maxMemoryUsed
            ),
        },
    }
}
