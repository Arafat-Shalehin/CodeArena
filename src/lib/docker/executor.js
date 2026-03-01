import Docker from 'dockerode'
import { Readable, PassThrough } from 'stream'
import path from 'path'
import { getLanguageConfig } from './languages.js'
import { getDockerRunConfig, validateCodeSecurity, SANDBOX_CONFIG } from './sandbox.js'

const dockerOptions = {}

// Use DOCKER_HOST from environment if available (e.g., when using docker-proxy)
if (process.env.DOCKER_HOST) {
    if (process.env.DOCKER_HOST.startsWith('http')) {
        const url = new URL(process.env.DOCKER_HOST)
        dockerOptions.host = url.hostname
        dockerOptions.port = url.port || 2375
        dockerOptions.protocol = url.protocol.replace(':', '')
    } else {
        dockerOptions.socketPath = process.env.DOCKER_HOST
    }
}

const docker = new Docker(dockerOptions)

/**
 * Execute code in a Docker container
 * @param {string} code - Source code to execute
 * @param {string} language - Programming language
 * @param {string} input - Input test case
 * @param {number} timeLimit - Time limit in milliseconds
 * @param {number} memoryLimit - Memory limit in KB
 * @param {number} outputLimit - Output limit in KB
 * @returns {Promise<Object>} - Execution result
 */
export async function executeCode({ code, language, input = '', timeLimit, memoryLimit, outputLimit }) {
    try {
        // Validate code security
        const securityCheck = validateCodeSecurity(code)
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
            input,
            effectiveTimeLimit,
            effectiveMemoryLimit,
            outputLimit || (SANDBOX_CONFIG.execution.maxOutputSize / 1024)
        )

        // Start container and get results
        const result = await runContainer(container, effectiveTimeLimit)

        // Cleanup container
        await cleanupContainer(container)

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
async function createContainer(langConfig, code, input, timeLimit, memoryLimit, outputLimit) {
    const dockerConfig = getDockerRunConfig(langConfig.name)
    const outputLimitBytes = outputLimit * 1024

    // Create container with tail command to keep it running (override ENTRYPOINT)
    const container = await docker.createContainer({
        Image: langConfig.image,
        Entrypoint: ['/bin/sh', '-c'],
        Cmd: ['tail -f /dev/null'], // Keep container alive indefinitely
        Env: [
            `TIME_LIMIT=${Math.ceil(timeLimit / 1000)}`,
            `MEMORY_LIMIT=${memoryLimit}`,
            `OUTPUT_LIMIT=${outputLimitBytes}`
        ],
        ...dockerConfig,
        OpenStdin: true,
        Tty: false,
    })

    // Start container first
    await container.start()

    // Wait a moment to make sure container is fully started
    await new Promise((resolve) => setTimeout(resolve, 500))

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

        // Write source code file using base64 encoding
        const codeB64 = Buffer.from(code).toString('base64')
        await runExec(`echo "${codeB64}" | base64 -d > /workspace/${langConfig.fileName}`)

        // Write input file if provided
        if (input) {
            const inputB64 = Buffer.from(input).toString('base64')
            await runExec(`echo "${inputB64}" | base64 -d > /workspace/input.txt`)
        }

        // Ensure workspace is fully writable by everyone (including coderunner)
        await runExec('chmod 777 /workspace && chmod 666 /workspace/* 2>/dev/null || true', 'root')

        // Verify setup (for debugging)
        const verifyOutput = await runExec('ls -la /workspace/ 2>&1', 'root')
        console.log('Workspace contents:', verifyOutput)
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
            memoryUsed: extractMemory(output),
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

    for (const line of lines) {
        if (line.includes('SUCCESS')) {
            capturing = true
            continue
        }
        if (capturing && !line.includes('Execution time') && !line.includes('Memory used')) {
            outputLines.push(line)
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
