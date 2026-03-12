/**
 * Judge0 Code Executor
 * Remote code execution via Judge0 API
 * Used as fallback when Docker is not available (e.g., in Railway production)
 */

// Language ID mapping for Judge0
// Only support languages that are in the CodeArena system
const LANGUAGE_MAP = {
    cpp: 54, // C++
    python: 71, // Python
    java: 62, // Java
    javascript: 63, // JavaScript/Node.js
}

/**
 * Execute code using Judge0 API
 * @param {Object} params - Execution parameters
 * @returns {Promise<Object>} - Execution result
 */
export async function executeCodeWithJudge0({
    code,
    language,
    input = '',
    timeLimit = 5000,
    memoryLimit = 256000,
}) {
    try {
        // Get Judge0 API configuration
        const judge0Url = process.env.JUDGE0_URL || 'https://judge0.p.rapidapi.com'
        const judge0ApiKey = process.env.JUDGE0_API_KEY

        if (!judge0ApiKey) {
            return {
                success: false,
                verdict: 'EXECUTOR_UNAVAILABLE',
                error: 'Judge0 API key not configured',
            }
        }

        // Map language to Judge0 language ID
        const languageId = LANGUAGE_MAP[language.toLowerCase()]
        if (!languageId) {
            return {
                success: false,
                verdict: 'EXECUTOR_UNAVAILABLE',
                error: `Language "${language}" not supported by Judge0`,
            }
        }

        // Step 1: Submit code to Judge0
        const submissionResponse = await fetch(`${judge0Url}/submissions?base64_encoded=false`, {
            method: 'POST',
            headers: {
                'X-RapidAPI-Key': judge0ApiKey,
                'X-RapidAPI-Host': 'judge0.p.rapidapi.com',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                language_id: languageId,
                source_code: code,
                stdin: input,
                cpu_time_limit: Math.ceil(timeLimit / 1000), // Convert ms to seconds
                memory_limit: memoryLimit,
            }),
        })

        if (!submissionResponse.ok) {
            console.error('Judge0 submission failed:', submissionResponse.status)
            return {
                success: false,
                verdict: 'SYSTEM_ERROR',
                error: 'Failed to submit code to Judge0',
            }
        }

        const submission = await submissionResponse.json()
        const token = submission.token

        // Step 2: Poll for result
        const result = await pollJudge0Result(token, judge0ApiKey, judge0Url)

        if (!result) {
            return {
                success: false,
                verdict: 'SYSTEM_ERROR',
                error: 'Judge0 timeout waiting for result',
            }
        }

        // Step 3: Convert Judge0 result to our format
        return parseJudge0Result(result)
    } catch (error) {
        console.error('Judge0 execution error:', error)
        return {
            success: false,
            verdict: 'SYSTEM_ERROR',
            error: error.message,
        }
    }
}

/**
 * Poll Judge0 for execution result
 */
async function pollJudge0Result(token, apiKey, baseUrl, maxAttempts = 50) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Wait before polling
        await new Promise((resolve) => setTimeout(resolve, 500 + attempt * 100))

        try {
            const response = await fetch(`${baseUrl}/submissions/${token}?base64_encoded=false`, {
                headers: {
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': 'judge0.p.rapidapi.com',
                },
            })

            if (!response.ok) continue

            const result = await response.json()

            // Status 1 = In Queue, 2 = Processing
            // Status >= 3 = Completed/Error
            if (result.status.id >= 3) {
                return result
            }
        } catch (error) {
            console.error('Judge0 poll error:', error)
            continue
        }
    }

    return null // Timeout
}

/**
 * Convert Judge0 result to our verdict format
 */
function parseJudge0Result(result) {
    const statusId = result.status.id
    const statusDescription = result.status.description

    // Judge0 Status codes:
    // 1 = In Queue
    // 2 = Processing
    // 3 = Accepted
    // 4 = Wrong Answer
    // 5 = Time Limit Exceeded
    // 6 = Compilation Error
    // 7-14 = Runtime Errors

    let verdict = 'RUNTIME_ERROR'
    let error = statusDescription

    switch (statusId) {
        case 3: // Accepted
            verdict = 'ACCEPTED'
            error = null
            break
        case 4: // Wrong Answer
            verdict = 'WRONG_ANSWER'
            error = 'Output does not match expected output'
            break
        case 5: // Time Limit Exceeded
            verdict = 'TIME_LIMIT_EXCEEDED'
            error = 'Execution time exceeded limit'
            break
        case 6: // Compilation Error
            verdict = 'COMPILATION_ERROR'
            error = result.compile_output || 'Compilation failed'
            break
        case 7:
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
        case 14: // Runtime Errors
            verdict = 'RUNTIME_ERROR'
            error = result.stderr || statusDescription
            break
        default:
            verdict = 'SYSTEM_ERROR'
            error = `Unknown Judge0 status: ${statusDescription}`
    }

    const output = result.stdout || ''

    return {
        success: statusId === 3,
        verdict,
        output: output.trim(),
        error: error || null,
        executionTime: Math.round((result.time || 0) * 1000), // Convert seconds to ms
        memoryUsed: result.memory || 0, // Already in MB from Judge0
    }
}

/**
 * Check if Judge0 is available
 */
export async function checkJudge0Availability() {
    if (!process.env.JUDGE0_API_KEY) {
        return { available: false, error: 'Judge0 API key not configured' }
    }

    try {
        const judge0Url = process.env.JUDGE0_URL || 'https://judge0.p.rapidapi.com'
        const response = await fetch(`${judge0Url}/about`, {
            headers: {
                'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
                'X-RapidAPI-Host': 'judge0.p.rapidapi.com',
            },
        })

        return { available: response.ok }
    } catch (error) {
        return { available: false, error: error.message }
    }
}
