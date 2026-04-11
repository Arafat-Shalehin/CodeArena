/**
 * Judge0 API Executor Module
 *
 * Provides fallback code execution using Judge0 API when Docker is unavailable.
 * Used in Railway production environment and other deployment scenarios
 * where Docker socket is not accessible.
 */

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://ce.judge0.com'
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || ''
const JUDGE0_AUTH_HEADER = process.env.JUDGE0_AUTH_HEADER || 'X-Auth-Token'
const JUDGE0_PUBLIC_FALLBACK_URL = process.env.JUDGE0_PUBLIC_FALLBACK_URL || 'https://ce.judge0.com'

function isRapidApiUrl(url) {
    try {
        return new URL(url).hostname.includes('rapidapi.com')
    } catch {
        return false
    }
}

function getRapidApiHost() {
    if (process.env.JUDGE0_RAPIDAPI_HOST) return process.env.JUDGE0_RAPIDAPI_HOST
    try {
        return new URL(JUDGE0_API_URL).hostname
    } catch {
        return 'judge0-ce.p.rapidapi.com'
    }
}

function buildJudge0Headers({ includeContentType = false } = {}) {
    const headers = {}

    if (includeContentType) {
        headers['Content-Type'] = 'application/json'
    }

    if (!JUDGE0_API_KEY) {
        return headers
    }

    if (isRapidApiUrl(JUDGE0_API_URL)) {
        headers['X-RapidAPI-Key'] = JUDGE0_API_KEY
        headers['X-RapidAPI-Host'] = getRapidApiHost()
        return headers
    }

    headers[JUDGE0_AUTH_HEADER] = JUDGE0_API_KEY
    return headers
}

function buildHeadersForUrl(url, { includeContentType = false } = {}) {
    if (url === JUDGE0_API_URL) {
        return buildJudge0Headers({ includeContentType })
    }

    const headers = {}
    if (includeContentType) headers['Content-Type'] = 'application/json'
    return headers
}

function shouldFallbackFromRapidApi(status, errorText) {
    const msg = (errorText || '').toLowerCase()
    return (
        status === 401 ||
        status === 402 ||
        status === 403 ||
        msg.includes('not subscribed') ||
        msg.includes('forbidden') ||
        msg.includes('invalid api key')
    )
}

// Language ID mappings for Judge0
const LANGUAGE_ID_MAP = {
    javascript: 63, // JavaScript (Node.js 12.14.0)
    python: 71, // Python (3.8.1)
    java: 62, // Java (javac 14.0.1)
    cpp: 54, // C++ (g++ 9.2.0)
    c: 50, // C (gcc 9.2.0)
}

/**
 * Check if Judge0 API is available and configured
 */
export async function checkJudge0Availability() {
    try {
        if (isRapidApiUrl(JUDGE0_API_URL) && !JUDGE0_API_KEY) {
            console.warn('Judge0 RapidAPI key not configured')
            return false
        }

        // Simple health check
        const response = await fetch(`${JUDGE0_API_URL}/languages`, {
            method: 'GET',
            headers: buildJudge0Headers(),
        })

        return response.ok
    } catch (err) {
        console.warn('Judge0 availability check failed:', err.message)
        return false
    }
}

/**
 * Execute code using Judge0 API
 *
 * @param {Object} options
 * @param {string} options.code - Code to execute
 * @param {string} options.language - Programming language
 * @param {string} options.input - Standard input
 * @param {number} options.timeLimit - Time limit in milliseconds
 * @param {number} options.memoryLimit - Memory limit in KB
 * @returns {Promise<Object>} - Execution result
 */
export async function executeCodeWithJudge0({
    code,
    language,
    input = '',
    timeLimit = 5000,
    memoryLimit = 512000,
}) {
    try {
        if (isRapidApiUrl(JUDGE0_API_URL) && !JUDGE0_API_KEY) {
            return {
                success: false,
                verdict: 'EXECUTOR_UNAVAILABLE',
                error: 'Judge0 RapidAPI key is missing. Set JUDGE0_API_KEY or use https://ce.judge0.com.',
            }
        }

        const languageId = LANGUAGE_ID_MAP[language]
        if (!languageId) {
            return {
                success: false,
                verdict: 'COMPILATION_ERROR',
                error: `Unsupported language: ${language}`,
            }
        }

        // Convert timeLimit from ms to seconds (Judge0 expects seconds)
        const cpuTimeLimit = Math.max(1, Math.ceil((Number(timeLimit) || 1000) / 1000))
        // Judge0 expects memory_limit in KB (not MB).
        const normalizedMemoryLimitKb = Math.max(16 * 1024, Number(memoryLimit) || 256 * 1024)

        let activeBaseUrl = JUDGE0_API_URL
        let createResponse = await fetch(
            `${activeBaseUrl}/submissions?base64_encoded=false&wait=false`,
            {
                method: 'POST',
                headers: buildHeadersForUrl(activeBaseUrl, { includeContentType: true }),
                body: JSON.stringify({
                    language_id: languageId,
                    source_code: code,
                    stdin: input,
                    cpu_time_limit: cpuTimeLimit,
                    memory_limit: normalizedMemoryLimitKb,
                }),
            }
        )

        if (!createResponse.ok) {
            const errorText = await createResponse.text().catch(() => '')

            if (
                isRapidApiUrl(activeBaseUrl) &&
                JUDGE0_PUBLIC_FALLBACK_URL &&
                shouldFallbackFromRapidApi(createResponse.status, errorText)
            ) {
                console.warn(
                    `[Judge0] RapidAPI access failed (${createResponse.status}). Retrying with public Judge0 endpoint.`
                )
                activeBaseUrl = JUDGE0_PUBLIC_FALLBACK_URL
                createResponse = await fetch(
                    `${activeBaseUrl}/submissions?base64_encoded=false&wait=false`,
                    {
                        method: 'POST',
                        headers: buildHeadersForUrl(activeBaseUrl, { includeContentType: true }),
                        body: JSON.stringify({
                            language_id: languageId,
                            source_code: code,
                            stdin: input,
                            cpu_time_limit: cpuTimeLimit,
                            memory_limit: normalizedMemoryLimitKb,
                        }),
                    }
                )
            }

            if (!createResponse.ok) {
                const retryErrorText = await createResponse.text().catch(() => '')
                throw new Error(
                    `Failed to create submission (${createResponse.status} ${createResponse.statusText})${retryErrorText ? `: ${retryErrorText}` : errorText ? `: ${errorText}` : ''}`
                )
            }
        }

        const { token } = await createResponse.json()

        // Poll for result with timeout
        const maxAttempts = 30
        const pollInterval = 500 // ms

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await new Promise((resolve) => setTimeout(resolve, pollInterval))

            const statusResponse = await fetch(
                `${activeBaseUrl}/submissions/${token}?base64_encoded=false`,
                {
                    method: 'GET',
                    headers: buildHeadersForUrl(activeBaseUrl),
                }
            )

            if (!statusResponse.ok) {
                continue
            }

            const submission = await statusResponse.json()

            // Check if submission is still processing
            if (submission.status.id <= 2) {
                // 1 = In Queue, 2 = Processing
                continue
            }

            // Submission is complete
            return parseJudge0Result(submission)
        }

        return {
            success: false,
            verdict: 'TIME_LIMIT_EXCEEDED',
            error: 'Judge0 execution timeout',
            executionTime: timeLimit,
        }
    } catch (error) {
        console.error('Judge0 execution error:', error)
        return {
            success: false,
            verdict: 'SYSTEM_ERROR',
            error: `Judge0 error: ${error.message}`,
        }
    }
}

/**
 * Parse Judge0 submission result
 *
 * @param {Object} submission - Judge0 submission response
 * @returns {Object} - Standardized execution result
 */
function parseJudge0Result(submission) {
    const status = submission.status.id
    const stdout = submission.stdout || ''
    const stderr = submission.stderr || ''
    const compilationError = submission.compile_output || ''
    const time = (submission.time || 0) * 1000 // Convert to ms
    const memory = submission.memory || 0

    // Map Judge0 status codes to our verdicts
    // 3 = Accepted, 4 = Wrong Answer, 5 = Time Limit Exceeded,
    // 6 = Compilation Error, 7 = Runtime Error, 8 = Memory Limit Exceeded
    let verdict = 'SYSTEM_ERROR'
    let errorMessage = ''

    switch (status) {
        case 3: // Accepted
            verdict = 'ACCEPTED'
            break
        case 4: // Wrong Answer
            verdict = 'WRONG_ANSWER'
            break
        case 5: // Time Limit Exceeded
            verdict = 'TIME_LIMIT_EXCEEDED'
            break
        case 6: // Compilation Error
            verdict = 'COMPILATION_ERROR'
            errorMessage = compilationError || 'Compilation failed'
            break
        case 7: // Runtime Error
            verdict = 'RUNTIME_ERROR'
            errorMessage = stderr || 'Runtime error'
            break
        case 8: // Memory Limit Exceeded
            verdict = 'MEMORY_LIMIT_EXCEEDED'
            break
        default:
            verdict = 'SYSTEM_ERROR'
            errorMessage = `Unknown Judge0 status: ${status}`
    }

    return {
        success: status === 3, // Only status 3 is success
        verdict,
        output: stdout,
        error: errorMessage,
        executionTime: time,
        memoryUsed: memory,
    }
}
