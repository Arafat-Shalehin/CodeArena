import fs from 'node:fs'
import path from 'node:path'

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET']

function parseEnvLine(line) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return null

    const exportPrefix = 'export '
    const normalized = trimmed.startsWith(exportPrefix)
        ? trimmed.slice(exportPrefix.length)
        : trimmed

    const eqIndex = normalized.indexOf('=')
    if (eqIndex <= 0) return null

    const key = normalized.slice(0, eqIndex).trim()
    let value = normalized.slice(eqIndex + 1).trim()

    if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
    ) {
        value = value.slice(1, -1)
    }

    return { key, value }
}

function loadEnvFileIfExists(filePath) {
    if (!fs.existsSync(filePath)) return

    const fileContents = fs.readFileSync(filePath, 'utf8')
    const lines = fileContents.split(/\r?\n/)

    for (const line of lines) {
        const parsed = parseEnvLine(line)
        if (!parsed) continue

        // Keep already exported shell vars as highest priority.
        if (process.env[parsed.key] === undefined) {
            process.env[parsed.key] = parsed.value
        }
    }
}

function loadEnvFiles() {
    const nodeEnv = process.env.NODE_ENV || 'development'
    const cwd = process.cwd()

    const candidateFiles = [`.env.${nodeEnv}.local`, '.env.local', `.env.${nodeEnv}`, '.env']

    for (const file of candidateFiles) {
        loadEnvFileIfExists(path.join(cwd, file))
    }
}

loadEnvFiles()

const missingOrEmptyVars = requiredEnvVars.filter((key) => {
    const value = process.env[key]
    return typeof value !== 'string' || value.trim() === ''
})

const hasRedisUrl = typeof process.env.REDIS_URL === 'string' && process.env.REDIS_URL.trim() !== ''
const hasRedisHostPort =
    typeof process.env.REDIS_HOST === 'string' &&
    process.env.REDIS_HOST.trim() !== '' &&
    typeof process.env.REDIS_PORT === 'string' &&
    process.env.REDIS_PORT.trim() !== ''

if (!hasRedisUrl && !hasRedisHostPort) {
    missingOrEmptyVars.push('REDIS_URL or REDIS_HOST+REDIS_PORT')
}

if (missingOrEmptyVars.length > 0) {
    console.error('[Preflight] Missing or empty required environment variables:')
    for (const key of missingOrEmptyVars) {
        console.error(`- ${key}`)
    }
    console.error('[Preflight] Startup aborted. Update your .env/.env.local or shell environment.')
    process.exit(1)
}

console.log('[Preflight] Environment validation passed.')
