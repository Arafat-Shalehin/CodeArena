import Docker from 'dockerode'
import { Readable, PassThrough } from 'stream'
import path from 'path'
import { getLanguageConfig } from './languages.js'
import { getDockerRunConfig, validateCodeSecurity, SANDBOX_CONFIG } from './sandbox.js'
import { executeCodeWithJudge0 } from '../judge0-executor.js'

const dockerOptions = {}

// Use DOCKER_TARGET from environment (preferred over DOCKER_HOST to avoid library-internal validation errors)
const dockerTarget = process.env.DOCKER_TARGET || process.env.DOCKER_HOST

if (dockerTarget) {
    if (dockerTarget.startsWith('http') || dockerTarget.startsWith('tcp')) {
        const sanitizedTarget = dockerTarget.replace('tcp://', 'http://').replace('https://', 'http://')
        const url = new URL(sanitizedTarget)
        dockerOptions.host = url.hostname
        dockerOptions.port = url.port || 2375
        // Disable TLS for localhost connections
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
            dockerOptions.protocol = 'http'
        } else {
            dockerOptions.protocol = url.protocol.replace(':', '')
        }
    } else {
        dockerOptions.socketPath = dockerTarget
    }
}

// Always strictly hide DOCKER_HOST from dockerode during initialization 
// so it is forced to use our explicitly configured dockerOptions instead of blindly
// falling back to http://localhost:2375.
const originalDockerHost = process.env.DOCKER_HOST
delete process.env.DOCKER_HOST

let docker = null
let dockerInitError = null
let dockerUnavailableReason = null
let dockerReachabilityCacheUntil = 0

const DOCKER_REACHABILITY_CACHE_MS = 15000
const CLOUD_FALLBACK_LOG_PREFIX =
    '[EXECUTOR][CLOUD_FALLBACK] Docker socket is not reachable. Falling back to Judge0.'

try {
    docker = new Docker(dockerOptions)
} catch (err) {
    // Docker unavailable (e.g., in Railway production without Docker socket)
    dockerInitError = err
    dockerUnavailableReason = err?.message || 'Docker initialization failed'
    console.warn('⚠️  Docker not available for code execution:', err.message)
} finally {
    // Restore it after initialization
    if (originalDockerHost) {
        process.env.DOCKER_HOST = originalDockerHost
    }
}

function getErrorMessage(errorOrMessage) {
    if (!errorOrMessage) return ''
    if (typeof errorOrMessage === 'string') return errorOrMessage
    return errorOrMessage.message || String(errorOrMessage)
}

function isDockerSocketUnreachable(errorOrMessage) {
    if (errorOrMessage && typeof errorOrMessage === 'object' && errorOrMessage.code) {
        const code = errorOrMessage.code.toLowerCase()
        if (code.includes('econnrefused') || code.includes('enoent') || code.includes('eacces')) {
            return true
        }
    }

    const message = getErrorMessage(errorOrMessage).toLowerCase()
    if (!message) return false

    return [
        'enoent',
        'econnrefused',
        'eacces',
        'epipe',
        'docker socket',
        'cannot connect to the docker daemon',
        'connect: no such file or directory',
        'permission denied',
        'npipe',
        '/var/run/docker.sock',
    ].some((token) => message.includes(token))
}

function markDockerUnavailable(errorOrMessage) {
    dockerUnavailableReason = getErrorMessage(errorOrMessage) || 'Docker socket unreachable'
    docker = null
    dockerReachabilityCacheUntil = 0
    console.warn(`${CLOUD_FALLBACK_LOG_PREFIX} reason=${dockerUnavailableReason}`)
}

async function isDockerReachable() {
    if (!docker) {
        return false
    }

    const now = Date.now()
    if (now < dockerReachabilityCacheUntil) {
        return true
    }

    try {
        await docker.ping()
        dockerReachabilityCacheUntil = now + DOCKER_REACHABILITY_CACHE_MS
        return true
    } catch (error) {
        if (isDockerSocketUnreachable(error)) {
            markDockerUnavailable(error)
        } else {
            console.warn(
                `[EXECUTOR] Docker ping failed, using Judge0 fallback for this execution: ${getErrorMessage(error)}`
            )
        }
        return false
    }
}

/**
 * Execute code in a Docker container
 * @param {string} code - Source code to execute (single-file fallback)
 * @param {Array} files - Array of { filename, content, isMain } for multi-file submissions
 * @param {string} language - Programming language
 * @param {string} input - Input test case
 * @param {number} timeLimit - Time limit in milliseconds
 * @param {number} memoryLimit - Memory limit in KB
 * @param {number} outputLimit - Output limit in KB
 * @param {string} specialJudgeCode - Code for special judge (JavaScript)
 * @param {string} expectedOutput - Expected output for special judge
 * @param {boolean} isPlayground - Set to true for playground/run mode (don't return ACCEPTED verdict)
 * @returns {Promise<Object>} - Execution result
 */
export async function executeCode({
    code,
    files,
    language,
    input = '',
    timeLimit,
    memoryLimit,
    outputLimit,
    specialJudgeCode,
    expectedOutput,
    isPlayground = false,
}) {
    try {
        console.log(`[EXECUTOR] executeCode called: language=${language}, codeLength=${code.length}, inputLength=${input.length}, isPlayground=${isPlayground}`)

        // Check if Docker is available
        if (await isDockerReachable()) {
            // Docker is available - try to use it with retry logic
            console.log('[EXECUTOR] Using Docker for code execution')
            let lastError = null
            const maxRetries = 2

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    const result = await executeCodeWithDocker({
                        code,
                        files,
                        language,
                        input,
                        timeLimit,
                        memoryLimit,
                        outputLimit,
                        specialJudgeCode,
                        expectedOutput,
                    })

                    console.log(`[EXECUTOR] Docker result (attempt ${attempt}): verdict=${result.verdict}, success=${result.success}, error=${result.error?.substring(0, 50)}`)

                    // If in playground mode, convert ACCEPTED to EXECUTED (no judging)
                    if (isPlayground && result.verdict === 'ACCEPTED') {
                        result.verdict = 'EXECUTED'
                    }

                    // If Docker succeeded or had a non-system error, return the result
                    if (result.success || (result.verdict !== 'SYSTEM_ERROR' && result.verdict !== 'EXECUTOR_UNAVAILABLE')) {
                        return result
                    }

                    // If Docker socket itself is unavailable, stop retrying and fall back to Judge0.
                    if (isDockerSocketUnreachable(result.error)) {
                        markDockerUnavailable(result.error)
                        break
                    }

                    // Store error for potential retry
                    lastError = result.error

                    if (attempt < maxRetries) {
                        console.log(`[EXECUTOR] Docker error on attempt ${attempt}, retrying...`)
                        // Wait before retry
                        await new Promise(resolve => setTimeout(resolve, 500))
                    }
                } catch (error) {
                    console.error(`[EXECUTOR] Docker error on attempt ${attempt}:`, error.message)
                    lastError = error.message

                    if (isDockerSocketUnreachable(error)) {
                        markDockerUnavailable(error)
                        break
                    }

                    if (attempt < maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, 500))
                    }
                }
            }

            // Docker failed after retries - log and fall back to Judge0
            console.error('[EXECUTOR] Docker execution failed after retries:', lastError)
            console.log('[EXECUTOR] Falling back to Judge0 API')
        } else {
            console.log(
                `[EXECUTOR] Docker not available, using Judge0 directly (${dockerUnavailableReason || dockerInitError?.message || 'no docker instance'})`
            )
        }

        // Docker not available or failed - fallback to Judge0
        console.log('[EXECUTOR] Using Judge0 API for code execution')
        const judge0Result = await executeCodeWithJudge0({
            code,
            language,
            input,
            timeLimit,
            memoryLimit,
        })

        console.log(`[EXECUTOR] Judge0 result: verdict=${judge0Result.verdict}, success=${judge0Result.success}`)

        // If in playground mode, convert ACCEPTED to EXECUTED (no judging)
        if (isPlayground && judge0Result.verdict === 'ACCEPTED') {
            judge0Result.verdict = 'EXECUTED'
        }

        // Handle special judge results (not supported with Judge0)
        if (specialJudgeCode && judge0Result.success) {
            return {
                ...judge0Result,
                success: false,
                verdict: 'FEATURE_UNSUPPORTED_IN_CLOUD',
                error: 'Special judge is not supported in cloud fallback mode (Judge0).',
            }
        }

        return judge0Result
    } catch (error) {
        console.error('[EXECUTOR] Code execution error:', error.message)
        return {
            success: false,
            verdict: 'SYSTEM_ERROR',
            error: error.message,
        }
    }
}

/**
 * Execute code against multiple inputs using a single Docker container.
 * Dramatically reduces latency for multi-test-case judge runs by reusing
 * the container lifecycle instead of creating one per test case.
 *
 * Returns an array of result objects (one per input), running every input
 * unless the caller explicitly requests an early stop.
 *
 * Falls back to null when Docker is unavailable so the caller can use Judge0.
 */
export async function executeMultipleInputs({
    code,
    files,
    language,
    inputs,
    timeLimit,
    memoryLimit,
    outputLimit,
    specialJudgeCode,
    expectedOutputs,
    onProgress, // callback for each test case completion
}) {
    // Security check once for all inputs
    const codeToValidate = files && files.length > 0 ? files.map((f) => f.content).join('\n') : code
    const securityCheck = validateCodeSecurity(codeToValidate)
    if (!securityCheck.isValid) {
        return inputs.map(() => ({
            success: false,
            verdict: 'SECURITY_ERROR',
            error: securityCheck.errors.join(', '),
        }))
    }

    if (!docker) {
        // Signal to caller: Docker unavailable, fall back to per-call Judge0
        return null
    }

    const langConfig = getLanguageConfig(language)
    const effectiveTimeLimit = timeLimit || langConfig.defaultTimeLimit
    const effectiveMemoryLimit = memoryLimit || langConfig.defaultMemoryLimit
    const effectiveOutputLimit = outputLimit || SANDBOX_CONFIG.execution.maxOutputSize / 1024

    let container
    try {
        // Create and start container ONCE, writing source code and first input
        container = await createContainer(
            langConfig,
            code,
            files,
            inputs[0] || '',
            effectiveTimeLimit,
            effectiveMemoryLimit,
            effectiveOutputLimit
        )
    } catch (err) {
        if (isDockerSocketUnreachable(err)) {
            markDockerUnavailable(err)
            return null
        }

        console.error('[EXECUTOR] executeMultipleInputs: container creation failed:', err.message)
        return inputs.map(() => ({
            success: false,
            verdict: 'SYSTEM_ERROR',
            error: err.message,
        }))
    }

    const results = []
    let judgeContainer = null
    let judgeContainerInitialized = false // Track if we've attempted to create

    try {
        for (let i = 0; i < inputs.length; i++) {
            console.log(`[EXECUTOR] 🏃 Running test case ${i + 1}/${inputs.length}...`)

            // For runs after the first, overwrite input.txt inside the existing container
            if (i > 0) {
                const inputContent = inputs[i] || ''
                const inputB64 = Buffer.from(inputContent).toString('base64')
                const exec = await container.exec({
                    Cmd: ['sh', '-c', `echo "${inputB64}" | base64 -d > /workspace/input.txt`],
                    AttachStdout: true,
                    AttachStderr: true,
                    User: 'root',
                })

                // Wait for the file write to complete synchronously using streams
                const stream = await exec.start({ Detach: false, Tty: false })
                await new Promise((resolve, reject) => {
                    const timeoutId = setTimeout(
                        () => reject(new Error('Timed out while updating input file in container')),
                        5000
                    )
                    const finish = () => {
                        clearTimeout(timeoutId)
                        resolve()
                    }
                    stream.on('end', finish)
                    stream.on('close', finish)
                    stream.on('error', (error) => {
                        clearTimeout(timeoutId)
                        reject(error)
                    })
                    stream.resume()
                })

                console.log(`[EXECUTOR] Input file written for test case ${i + 1}`)
            }

            let result
            try {
                console.log(`[EXECUTOR] Calling runContainer for test case ${i + 1}...`)
                const skipCompile = i > 0 // Skip compilation for subsequent runs
                result = await runContainer(container, effectiveTimeLimit, skipCompile)
                console.log(`[EXECUTOR] ✅ Test case ${i + 1} completed: verdict=${result.verdict}, time=${result.executionTime}ms`)
            } catch (runErr) {
                console.error(`[EXECUTOR] ❌ Test case ${i + 1} error:`, runErr.message)
                result = { success: false, verdict: 'SYSTEM_ERROR', error: runErr.message }
            }

            // Handle special judge if provided
            if (result.success && specialJudgeCode && expectedOutputs?.[i]) {
                // Lazy-create special judge container on first use (once, reuse for all test cases)
                if (!judgeContainerInitialized) {
                    judgeContainerInitialized = true
                    try {
                        const langConfig = getLanguageConfig('javascript')
                        const dockerConfig = getDockerRunConfig(langConfig.name)
                        judgeContainer = await docker.createContainer({
                            Image: langConfig.image,
                            Entrypoint: ['/bin/sh', '-c'],
                            Cmd: ['tail -f /dev/null'],
                            ...dockerConfig,
                            OpenStdin: true,
                            Tty: false,
                        })
                        await judgeContainer.start()
                        console.log('[EXECUTOR] Special judge container created for reuse across test cases')
                    } catch (err) {
                        console.error('[EXECUTOR] Failed to create special judge container:', err.message)
                        judgeContainer = null
                    }
                }

                const judgeResult = await runSpecialJudgeInSandbox({
                    specialJudgeCode,
                    input: inputs[i] || '',
                    actualOutput: result.output,
                    expectedOutput: expectedOutputs[i],
                    judgeContainer: judgeContainer, // Reuse if created
                })
                if (!judgeResult.success) {
                    result = {
                        ...result,
                        success: false,
                        verdict: 'WRONG_ANSWER',
                        error: judgeResult.error || 'Special judge rejected the output',
                    }
                }
            }

            results.push(result)

            // Let the caller decide whether to stop early.
            let abortExec = false
            if (onProgress) {
                const callerAbort = await onProgress(result, i)
                if (callerAbort !== undefined) abortExec = callerAbort
            }

            if (abortExec) {
                break
            }
        }
    } finally {
        await cleanupContainer(container)
        if (judgeContainer) {
            await cleanupContainer(judgeContainer)
            console.log('[EXECUTOR] Special judge container cleaned up')
        }
    }

    return results
}

/**
 * Execute code using Docker
 * Internal function used when Docker is available
 */
async function executeCodeWithDocker({
    code,
    files,
    language,
    input = '',
    timeLimit,
    memoryLimit,
    outputLimit,
    specialJudgeCode,
    expectedOutput,
}) {
    try {
        // Validate code security — check all files or single code
        const codeToValidate =
            files && files.length > 0 ? files.map((f) => f.content).join('\n') : code

        const securityCheck = validateCodeSecurity(codeToValidate)
        if (!securityCheck.isValid) {
            return {
                success: false,
                verdict: 'SECURITY_ERROR',
                error: securityCheck.errors.join(', '),
            }
        }

        // Get language configuration
        const langConfig = getLanguageConfig(language)

        // Use provided limits or defaults
        const effectiveTimeLimit = timeLimit || langConfig.defaultTimeLimit
        const effectiveMemoryLimit = memoryLimit || langConfig.defaultMemoryLimit

        // Create container
        const container = await createContainer(
            langConfig,
            code,
            files,
            input,
            effectiveTimeLimit,
            effectiveMemoryLimit,
            outputLimit || SANDBOX_CONFIG.execution.maxOutputSize / 1024
        )

        // Start container and get results
        const result = await runContainer(container, effectiveTimeLimit)

        // Cleanup container
        await cleanupContainer(container)

        // Handle Special Judge if result was SUCCESS
        if (result.success && specialJudgeCode) {
            const judgeResult = await runSpecialJudgeInSandbox({
                specialJudgeCode,
                input,
                actualOutput: result.output,
                expectedOutput: expectedOutput || '',
            })

            if (!judgeResult.success) {
                return {
                    ...result,
                    success: false,
                    verdict: 'WRONG_ANSWER',
                    error: judgeResult.error || 'Special judge rejected the output',
                }
            }
        }

        return result
    } catch (error) {
        console.error('Code execution error:', error)
        return {
            success: false,
            verdict: 'SYSTEM_ERROR',
            error: error.message,
        }
    }
}

/**
 * Create a Docker container with code and input
 */
async function createContainer(langConfig, code, files, input, timeLimit, memoryLimit, outputLimit) {
    const dockerConfig = getDockerRunConfig(langConfig.name)
    const outputLimitBytes = outputLimit * 1024

    // Determine if this is a multi-file submission
    const isMultiFile = files && files.length > 0

    // Check if Docker image exists
    console.log(`[EXECUTOR] Checking for Docker image: ${langConfig.image}`)
    try {
        const image = docker.getImage(langConfig.image)
        await image.inspect()
        console.log(`[EXECUTOR] ✅ Docker image exists: ${langConfig.image}`)
    } catch (imgError) {
        if (isDockerSocketUnreachable(imgError)) {
            // Let caller fall back to Judge0 when Docker daemon/socket is unreachable.
            markDockerUnavailable(imgError)
            throw imgError
        }

        console.error(`[EXECUTOR] ❌ Docker image not found: ${langConfig.image}`)
        console.error(`[EXECUTOR] Error:`, imgError)

        // List available images for debugging
        try {
            const images = await docker.listImages()
            const relevantImages = images.filter(img =>
                img.RepoTags?.some(tag =>
                    tag.includes('executor') || tag.includes('codearena')
                )
            )
            if (relevantImages.length > 0) {
                console.error('[EXECUTOR] Available executor images:')
                relevantImages.forEach(img => {
                    console.error(`  - ${img.RepoTags?.[0] || 'untagged'} (${(img.Size / 1024 / 1024).toFixed(1)}MB)`)
                })
            } else {
                console.error('[EXECUTOR] No executor images found. Build them with: docker/scripts/build-images.sh')
            }
        } catch (listError) {
            console.error('[EXECUTOR] Could not list Docker images:', listError)
        }

        throw new Error(`Docker image ${langConfig.image} not found. Build it using: docker/scripts/build-images.sh`)
    }

    // Create container with tail command to keep it running (override ENTRYPOINT)
    // For multi-file Java, detect the main class name
    const mainClass = isMultiFile
        ? (files.find(f => f.isMain)?.filename || langConfig.mainFile).replace(/\.java$/, '')
        : 'Solution'

    const container = await docker.createContainer({
        Image: langConfig.image,
        Entrypoint: ['/bin/sh', '-c'],
        Cmd: ['tail -f /dev/null'], // Keep container alive indefinitely
        Env: [
            `TIME_LIMIT=${Math.ceil(timeLimit / 1000)}`,
            `MEMORY_LIMIT=${memoryLimit}`,
            `OUTPUT_LIMIT=${outputLimitBytes}`,
            `MULTI_FILE=${isMultiFile ? '1' : '0'}`,
            `MAIN_CLASS=${mainClass}`,
        ],
        ...dockerConfig,
        OpenStdin: true,
        Tty: false,
    })

    // Start container first
    await container.start()

    // Verify container is actually running with better diagnostics
    let startupAttempts = 0
    let containerInfo = null
    while (startupAttempts < 10) {
        try {
            containerInfo = await container.inspect()
            console.log(`[EXECUTOR] Startup attempt ${startupAttempts + 1}: Running=${containerInfo.State.Running}, Status=${containerInfo.State.Status}`)

            if (containerInfo.State.Running) {
                console.log('[EXECUTOR] ✅ Container is running, ID:', container.id.substring(0, 12))
                break
            }
        } catch (e) {
            console.log(`[EXECUTOR] Startup attempt ${startupAttempts + 1}: Inspect failed - ${e.message}`)
        }
        startupAttempts++
        if (startupAttempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 50))
        }
    }

    if (!containerInfo?.State.Running) {
        console.error('[EXECUTOR] ❌ Container failed to start or stopped unexpectedly')
        console.error('[EXECUTOR] Final container state:', containerInfo?.State)

        // Get container logs to see what went wrong
        try {
            const logs = await container.logs({
                stdout: true,
                stderr: true,
                follow: false,
            })
            console.error('[EXECUTOR] Container logs:', logs.toString('utf8'))
        } catch (logError) {
            console.error('[EXECUTOR] Could not retrieve container logs:', logError.message)
        }

        try {
            await container.remove({ force: true })
        } catch (e) {
            // Ignore cleanup errors
        }
        throw new Error(`Container startup failed with ExitCode ${containerInfo?.State.ExitCode}. State: ${containerInfo?.State.Status || 'unknown'}`)
    }

    // Write files using exec
    try {

        // Helper function to run exec and wait for completion
        const runExec = async (cmd, user = 'root') => {
            const exec = await container.exec({
                Cmd: ['sh', '-c', cmd],
                AttachStdout: true,
                AttachStderr: true,
                User: user,
            })
            const stream = await exec.start({ Detach: false, Tty: false })

            let output = ''
            stream.on('data', (chunk) => {
                output += chunk.toString('utf8')
            })

            await new Promise((resolve, reject) => {
                const timeoutId = setTimeout(
                    () => reject(new Error('Timed out while writing files into container')),
                    8000
                )
                const finish = () => {
                    clearTimeout(timeoutId)
                    resolve()
                }
                stream.on('end', finish)
                stream.on('close', finish)
                stream.on('error', (error) => {
                    clearTimeout(timeoutId)
                    reject(error)
                })
                stream.resume()
            })

            return output
        }

        // Set workspace directory with full permissions for all operations
        await runExec('rm -f /workspace/* && chmod 777 /workspace', 'root')

        // Write source code file(s) using base64 encoding
        if (isMultiFile) {
            // Multi-file submission: write each file individually
            for (const file of files) {
                const fileB64 = Buffer.from(file.content).toString('base64')
                await runExec(`echo "${fileB64}" | base64 -d > /workspace/${file.filename}`)
            }
        } else {
            // Single-file submission (backward compatible)
            const codeB64 = Buffer.from(code).toString('base64')
            await runExec(`echo "${codeB64}" | base64 -d > /workspace/${langConfig.fileName}`)
        }

        // Write input file if provided
        if (input) {
            const inputB64 = Buffer.from(input).toString('base64')
            await runExec(`echo "${inputB64}" | base64 -d > /workspace/input.txt`)
        }

        // Dynamically inject SKIP_COMPILE support into the runner scripts 
        // just in case the executor images haven't been rebuilt yet.
        if (langConfig.name === 'cpp' || langConfig.name === 'java') {
            await runExec(`if grep -q "echo \\"Compiling" /usr/local/bin/runner.sh && ! grep -q "SKIP_COMPILE" /usr/local/bin/runner.sh; then sed -i '/^echo "Compiling/i if [ "$SKIP_COMPILE" != "1" ]; then' /usr/local/bin/runner.sh || true && sed -i '/^echo "Executing/i fi' /usr/local/bin/runner.sh || true; fi`, 'root');
        }

        // Ensure workspace is fully writable by everyone (including coderunner)
        await runExec('chmod 777 /workspace && chmod 666 /workspace/* 2>/dev/null || true', 'root')
    } catch (error) {
        console.error('[EXECUTOR] ❌ Error writing files to container:', error.message)
        console.error('[EXECUTOR] Error details:', error)

        // Try to inspect container state for debugging
        try {
            const finalState = await container.inspect()
            console.error('[EXECUTOR] Container state at failure:', finalState.State)
        } catch (e) {
            console.error('[EXECUTOR] Could not inspect container at failure')
        }

        try {
            await container.stop()
        } catch (stopError) {
            // Ignore if already stopped
        }
        try {
            await container.remove({ force: true })
        } catch (removeError) {
            // Ignore removal errors
        }
        throw new Error('Failed to write files to container: ' + error.message)
    }

    return container
}

/**
 * Run container and collect results
 */
async function runContainer(container, timeLimit, skipCompile = false) {
    const startTime = Date.now()
    let timeoutId = null

    try {
        // Execute the runner script as coderunner user
        console.log(`[EXECUTOR] Starting exec for runner.sh... (skipCompile=${skipCompile})`)
        const exec = await container.exec({
            Cmd: ['/usr/local/bin/runner.sh'],
            AttachStdout: true,
            AttachStderr: true,
            User: 'coderunner',
            Env: skipCompile ? ['SKIP_COMPILE=1'] : [],
        })

        // Start execution with timeout
        console.log('[EXECUTOR] Exec created, starting stream...')
        const execStream = await exec.start({ Detach: false, Tty: false })
        console.log('[EXECUTOR] Stream started, setting up demux...')

        // Collect output using PassThrough streams to handle Docker's multiplexing
        const stdoutStream = new PassThrough()
        const stderrStream = new PassThrough()

        // Use container's modem to demultiplex the stream (separates stdout from stderr and removes headers)
        container.modem.demuxStream(execStream, stdoutStream, stderrStream)

        // ── Output collection with 10 MB kill switch ──────────────────────
        const outputChunks = []
        let outputByteCount = 0
        let outputKilled = false
        const MAX_OUTPUT_BYTES = 10 * 1024 * 1024 // 10 MB hard ceiling

        const streamPromise = new Promise((resolve, reject) => {
            const killIfOverLimit = () => {
                if (outputKilled) return
                outputKilled = true
                console.warn(
                    '[EXECUTOR] ⚠️ Output exceeded 10 MB kill switch — destroying streams'
                )
                stdoutStream.destroy()
                stderrStream.destroy()
                execStream.destroy()
                container.stop({ t: 0 }).catch(() => {})
                resolve() // Unblock the race so we can return a verdict
            }

            stdoutStream.on('data', (chunk) => {
                outputByteCount += chunk.length
                if (outputByteCount > MAX_OUTPUT_BYTES) return killIfOverLimit()
                outputChunks.push(chunk.toString('utf8'))
            })
            stderrStream.on('data', (chunk) => {
                outputByteCount += chunk.length
                if (outputByteCount > MAX_OUTPUT_BYTES) return killIfOverLimit()
                outputChunks.push(chunk.toString('utf8'))
            })

            // Resolve when the main stream ends
            execStream.on('end', resolve)
            execStream.on('close', resolve)

            // Handle errors
            execStream.on('error', reject)
        })

        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(
                () => reject(new Error('TIME_LIMIT_EXCEEDED')),
                timeLimit + 1000
            )
        })

        await Promise.race([streamPromise, timeoutPromise])

        // If the kill switch fired, return immediately with a clear verdict
        if (outputKilled) {
            return {
                success: false,
                verdict: 'OUTPUT_LIMIT_EXCEEDED',
                error: 'Output exceeded 10 MB safety limit — execution terminated',
                executionTime: Date.now() - startTime,
            }
        }

        console.log('[EXECUTOR] Stream completed, getting exit code...')

        const executionTime = Date.now() - startTime

        // Get exit code
        const inspectExec = await exec.inspect()
        const statusCode = inspectExec.ExitCode || 0

        // Join collected chunks into single output string
        const output = outputChunks.join('')

        // Parse output
        return parseExecutionOutput(output, statusCode, executionTime)
    } catch (error) {
        if (error.message === 'TIME_LIMIT_EXCEEDED') {
            try {
                await container.stop({ t: 0 })
            } catch (stopError) {
                // Ignore if container is already stopped
                if (
                    !stopError.message.includes('already stopped') &&
                    stopError.statusCode !== 304
                ) {
                    console.error('Error stopping container:', stopError)
                }
            }
            return {
                success: false,
                verdict: 'TIME_LIMIT_EXCEEDED',
                executionTime: timeLimit,
                error: 'Execution time exceeded limit',
            }
        }
        throw error
    } finally {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
    }
}

/**
 * Parse execution output and determine verdict
 */
function parseExecutionOutput(output, statusCode, executionTime) {
    const lines = output.split('\n')

    // Check for known error patterns
    if (output.includes('COMPILATION_ERROR')) {
        return {
            success: false,
            verdict: 'COMPILATION_ERROR',
            error: extractError(output),
            executionTime: 0,
        }
    }

    if (output.includes('TIME_LIMIT_EXCEEDED')) {
        return {
            success: false,
            verdict: 'TIME_LIMIT_EXCEEDED',
            executionTime,
            error: 'Time limit exceeded',
        }
    }

    if (output.includes('MEMORY_LIMIT_EXCEEDED')) {
        return {
            success: false,
            verdict: 'MEMORY_LIMIT_EXCEEDED',
            memoryUsed: extractMemory(output),
            error: 'Memory limit exceeded',
        }
    }

    if (output.includes('RUNTIME_ERROR') || statusCode !== 0) {
        return {
            success: false,
            verdict: 'RUNTIME_ERROR',
            error: extractError(output),
            executionTime,
        }
    }

    // Success case - use 'ACCEPTED' per VERDICTS constants
    if (output.includes('SUCCESS')) {
        return {
            success: true,
            verdict: 'ACCEPTED',
            output: extractOutput(output),
            executionTime: extractExecutionTime(output) || executionTime,
            memoryUsed: extractMemory(output) || 0,
        }
    }

    // Unknown error
    return {
        success: false,
        verdict: 'RUNTIME_ERROR',
        error: 'Unknown execution error',
        output: output.substring(0, 1000),
    }
}

/**
 * Extract error message from output
 */
function extractError(output) {
    const lines = output.split('\n')
    const errorLines = lines.filter(
        (line) => !line.includes('Compiling') && !line.includes('Executing') && line.trim() !== ''
    )
    return errorLines.slice(0, 10).join('\n')
}

/**
 * Extract program output
 */
function extractOutput(output) {
    const lines = output.split('\n')
    let capturing = false
    const outputLines = []

    // Patterns to exclude from the final program output
    const internalPatterns = [
        'SUCCESS',
        'Execution time:',
        'Memory used:',
        'Compiling',
        'Executing',
        'runner.sh:',
        '[:'
    ]

    for (const line of lines) {
        if (line.includes('SUCCESS')) {
            capturing = true
            continue
        }
        if (capturing) {
            const isInternal = internalPatterns.some((p) => line.includes(p))
            if (!isInternal) {
                outputLines.push(line)
            }
        }
    }

    return outputLines.join('\n').trim()
}

/**
 * Extract execution time from output
 */
function extractExecutionTime(output) {
    const match = output.match(/Execution time:\s*(\d+)ms/)
    return match ? parseInt(match[1]) : null
}

/**
 * Extract memory usage from output
 */
function extractMemory(output) {
    const match = output.match(/Memory used:\s*(\d+)KB/)
    return match ? parseInt(match[1]) : null
}

/**
 * Run special judge code in a dedicated sandbox
 * @param {object} judgeContainer - Optional pre-created container to reuse (for batch processing)
 */
async function runSpecialJudgeInSandbox({
    specialJudgeCode,
    input,
    actualOutput,
    expectedOutput,
    judgeContainer,
}) {
    try {
        // Create a wrapper for the special judge code
        // The code expects 'input', 'output', and 'expected' variables
        const wrapper = `
const input = process.env.INPUT;
const output = process.env.ACTUAL_OUTPUT;
const expected = process.env.EXPECTED_OUTPUT;

try {
    const judgeFn = (function(input, output, expected) {
        ${specialJudgeCode}
    });

    // We expect the specialJudgeCode to either 'return' a value or be a block that we can wrap
    // If it doesn't have a return, we might need to handle it.
    // Given the previous eval implementation, it's likely a block.

    const result = judgeFn(input, output, expected);
    process.stdout.write(result ? "PASS" : "FAIL");
} catch (e) {
    process.stderr.write(e.message);
    process.exit(1);
}
`

        let container
        let shouldCleanup = true

        // If a container is provided (reuse mode), use it
        if (judgeContainer) {
            container = judgeContainer
            shouldCleanup = false
        } else {
            // Otherwise create a new container (single-use mode, fallback)
            const langConfig = getLanguageConfig('javascript')
            const dockerConfig = getDockerRunConfig(langConfig.name)

            container = await docker.createContainer({
                Image: langConfig.image,
                Entrypoint: ['node', '-e', wrapper],
                Env: [
                    `INPUT=${input}`,
                    `ACTUAL_OUTPUT=${actualOutput}`,
                    `EXPECTED_OUTPUT=${expectedOutput}`,
                ],
                ...dockerConfig,
            })

            await container.start()
            shouldCleanup = true
        }

        // Execute special judge code
        const env = [
            `INPUT=${input}`,
            `ACTUAL_OUTPUT=${actualOutput}`,
            `EXPECTED_OUTPUT=${expectedOutput}`,
        ]

        const exec = await container.exec({
            Cmd: ['node', '-e', wrapper],
            Env: env,
            AttachStdout: true,
            AttachStderr: true,
            User: 'node',
        })

        const execStream = await exec.start({ Detach: false, Tty: false })

        let output = ''
        const outputPromise = new Promise((resolve, reject) => {
            execStream.on('data', (chunk) => {
                output += chunk.toString('utf8')
            })
            execStream.on('end', resolve)
            execStream.on('close', resolve)
            execStream.on('error', reject)
        })

        await outputPromise

        // Check exit code
        const execInfo = await exec.inspect()
        if (execInfo.ExitCode !== 0) {
            if (shouldCleanup) await cleanupContainer(container)
            return { success: false, error: 'Special judge crashed: ' + output }
        }

        if (shouldCleanup) await cleanupContainer(container)

        return { success: output.trim().includes('PASS') }
    } catch (error) {
        console.error('Special judge execution error:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Cleanup container
 */
async function cleanupContainer(container) {
    try {
        await container.remove({ force: true })
    } catch (error) {
        console.error('Container cleanup error:', error)
    }
}

/**
 * Check if Docker is available
 */
export async function checkDockerAvailability() {
    try {
        const available = await isDockerReachable()
        if (available) {
            return { available: true }
        }

        return {
            available: false,
            error: dockerUnavailableReason || dockerInitError?.message || 'Docker unavailable',
        }
    } catch (error) {
        return { available: false, error: error.message }
    }
}

/**
 * Get list of available executor images
 */
export async function getExecutorImages() {
    try {
        const images = await docker.listImages()
        return images
            .filter(
                (img) =>
                    img.RepoTags && img.RepoTags.some((tag) => tag.includes('codearena-executor'))
            )
            .map((img) => ({
                tags: img.RepoTags,
                size: img.Size,
                created: img.Created,
            }))
    } catch (error) {
        console.error('Error listing images:', error)
        return []
    }
}

// ─── Zombie Container Janitor ──────────────────────────────────────────────
// Prunes orphaned executor containers that outlive their expected lifespan.
// Protects against containers left behind when codearena-app crashes/restarts.
const JANITOR_INTERVAL_MS = 5 * 60 * 1000 // Run every 5 minutes
const JANITOR_MAX_AGE_S = 5 * 60 // Kill containers older than 5 minutes

async function pruneOrphanedExecutors() {
    if (!docker) return

    try {
        const containers = await docker.listContainers({
            all: true,
            filters: { label: ['codearena.role=executor'] },
        })

        const nowSeconds = Math.floor(Date.now() / 1000)
        let pruned = 0

        for (const info of containers) {
            const ageSeconds = nowSeconds - info.Created
            if (ageSeconds > JANITOR_MAX_AGE_S) {
                try {
                    const c = docker.getContainer(info.Id)
                    await c.remove({ force: true })
                    pruned++
                    console.log(
                        `[JANITOR] 🧹 Pruned orphan executor ${info.Id.substring(0, 12)} (age: ${ageSeconds}s)`
                    )
                } catch (err) {
                    // Container may have already been removed between list and remove
                    if (!err.message?.includes('No such container')) {
                        console.warn(
                            `[JANITOR] Could not prune ${info.Id.substring(0, 12)}: ${err.message}`
                        )
                    }
                }
            }
        }

        if (pruned > 0) {
            console.log(`[JANITOR] Cleaned up ${pruned} orphaned executor container(s)`)
        }
    } catch (err) {
        if (isDockerSocketUnreachable(err)) return
        console.warn('[JANITOR] Orphan cleanup error:', err.message)
    }
}

// Start the janitor only when Docker is available
if (docker) {
    setInterval(pruneOrphanedExecutors, JANITOR_INTERVAL_MS)
    // Run once shortly after startup to clear leftovers from previous crashes
    setTimeout(pruneOrphanedExecutors, 10_000)
    console.log('[JANITOR] 🧹 Zombie container janitor armed (interval: 5 min, max-age: 5 min)')
}
