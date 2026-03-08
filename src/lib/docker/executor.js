import Docker from 'dockerode'
import { Readable, PassThrough } from 'stream'
import path from 'path'
import { getLanguageConfig } from './languages.js'
import { getDockerRunConfig, validateCodeSecurity, SANDBOX_CONFIG } from './sandbox.js'

const dockerOptions = {}

// Use DOCKER_TARGET from environment (preferred over DOCKER_HOST to avoid library-internal validation errors)
const dockerTarget = process.env.DOCKER_TARGET || process.env.DOCKER_HOST

if (dockerTarget) {
    if (dockerTarget.startsWith('http') || dockerTarget.startsWith('tcp')) {
        const sanitizedTarget = dockerTarget.replace('tcp://', 'http://')
        const url = new URL(sanitizedTarget)
        dockerOptions.host = url.hostname
        dockerOptions.port = url.port || 2375
        dockerOptions.protocol = url.protocol.replace(':', '')
    } else {
        dockerOptions.socketPath = dockerTarget
    }
}

// 🛡️ CRITICAL FIX FOR WINDOWS: 
// The dockerode library/dependencies sometimes auto-validate process.env.DOCKER_HOST 
// even if options are passed. If it's a Windows pipe, it might throw "should be tcp://...".
// We temporarily hide it during initialization.
const originalDockerHost = process.env.DOCKER_HOST
if (originalDockerHost && !originalDockerHost.startsWith('tcp') && !originalDockerHost.startsWith('http')) {
    delete process.env.DOCKER_HOST
}

let docker
try {
    docker = new Docker(dockerOptions)
} finally {
    // Restore it after initialization
    if (originalDockerHost) {
        process.env.DOCKER_HOST = originalDockerHost
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

    // Wait a moment to make sure container is fully started
    await new Promise((resolve) => setTimeout(resolve, 1000))

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
                stream.on('end', resolve)
                stream.on('error', reject)
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

        // Ensure workspace is fully writable by everyone (including coderunner)
        await runExec('chmod 777 /workspace && chmod 666 /workspace/* 2>/dev/null || true', 'root')
    } catch (error) {
        console.error('Error writing files to container:', error)
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
async function runContainer(container, timeLimit) {
    const startTime = Date.now()

    try {
        // Execute the runner script as coderunner user
        const exec = await container.exec({
            Cmd: ['/usr/local/bin/runner.sh'],
            AttachStdout: true,
            AttachStderr: true,
            User: 'coderunner',
        })

        // Start execution with timeout
        const execStream = await exec.start({ Detach: false, Tty: false })

        // Collect output using PassThrough streams to handle Docker's multiplexing
        const stdoutStream = new PassThrough()
        const stderrStream = new PassThrough()

        // Use container's modem to demultiplex the stream (separates stdout from stderr and removes headers)
        container.modem.demuxStream(execStream, stdoutStream, stderrStream)

        let output = ''
        const streamPromise = new Promise((resolve, reject) => {
            stdoutStream.on('data', (chunk) => {
                output += chunk.toString('utf8')
                // Early check for output limit
                if (output.length > (SANDBOX_CONFIG.execution.maxOutputSize * 1.1)) {
                    // We let it finish or head will truncate it inside container
                }
            })
            stderrStream.on('data', (chunk) => {
                output += chunk.toString('utf8')
            })

            // Resolve when the main stream ends
            execStream.on('end', resolve)
            execStream.on('close', resolve)

            // Handle errors
            execStream.on('error', reject)
        })

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('TIME_LIMIT_EXCEEDED')), timeLimit + 1000)
        )

        await Promise.race([streamPromise, timeoutPromise])

        const executionTime = Date.now() - startTime

        // Get exit code
        const inspectExec = await exec.inspect()
        const statusCode = inspectExec.ExitCode || 0

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

    // Success case
    if (output.includes('SUCCESS')) {
        return {
            success: true,
            verdict: 'SUCCESS',
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
 */
async function runSpecialJudgeInSandbox({
    specialJudgeCode,
    input,
    actualOutput,
    expectedOutput,
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

        const langConfig = getLanguageConfig('javascript')
        const dockerConfig = getDockerRunConfig(langConfig.name)

        const container = await docker.createContainer({
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

        // Wait for completion
        const result = await container.wait()
        const logs = await container.logs({ stdout: true, stderr: true })
        const outputString = logs.toString('utf8').trim()

        await cleanupContainer(container)

        if (result.StatusCode !== 0) {
            return { success: false, error: 'Special judge crashed: ' + outputString }
        }

        return { success: outputString.includes('PASS') }
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
        await docker.ping()
        return { available: true }
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
