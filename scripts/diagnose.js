const mongoose = require('mongoose')
const Docker = require('dockerode')
require('dotenv').config({ path: './.env.local' })
// Fallback to .env if .env.local didn't load everything (or for the script's sake)
require('dotenv').config()

// --- Utility Functions for Styling ---
const c = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
}

function printHeader(title) {
    console.log(`\n${c.cyan}${c.bold}=== ${title.toUpperCase()} ===${c.reset}`)
}

function printSuccess(msg, detail = '') {
    console.log(`${c.green}✅ ${msg}${c.reset} ${c.gray}${detail}${c.reset}`)
}

function printError(msg, detail = '', tip = '') {
    console.log(`${c.red}❌ ${msg}${c.reset} ${detail ? `\n   ↳ ${c.red}${detail}${c.reset}` : ''}`)
    if (tip) console.log(`   💡 ${c.yellow}${tip}${c.reset}`)
}

function printWarning(msg, detail = '') {
    console.log(`${c.yellow}⚠️  ${msg}${c.reset} ${c.gray}${detail}${c.reset}`)
}

function printInfo(msg, detail = '') {
    console.log(`${c.blue}ℹ️  ${msg}${c.reset} ${c.gray}${detail}${c.reset}`)
}

// --- Diagnostic State ---
const results = {
    env: { status: 'pass', issues: [] },
    security: { status: 'pass', issues: [] },
    firebase: { status: 'pass', issues: [] },
    db: { status: 'pending', issues: [] },
    docker: { status: 'pending', issues: [] },
}

async function runDiagnostics() {
    console.clear()
    console.log(`${c.bold}${c.green}🚀 CODEARENA SYSTEM DIAGNOSTICS & HEALTH CHECK 🚀${c.reset}`)
    console.log(`${c.gray}Time: ${new Date().toISOString()}${c.reset}`)

    // ---------------------------------------------------------
    // 1. Environment Variables Check
    // ---------------------------------------------------------
    printHeader('Environment Configuration')
    const requiredEnv = ['MONGODB_URI', 'JWT_SECRET', 'DOCKER_HOST']
    const missingEnv = requiredEnv.filter((key) => !process.env[key])

    if (missingEnv.length === 0) {
        printSuccess('Core Environment Variables', '(All required keys are present)')
    } else {
        results.env.status = 'fail'
        results.env.issues.push(`Missing: ${missingEnv.join(', ')}`)
        printError(
            'Core Environment Variables',
            `Missing keys: ${missingEnv.join(', ')}`,
            'Check your .env or .env.local file.'
        )
    }

    if (process.env.MONGODB_URI) {
        printInfo('MongoDB URI Structure', process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@'))
    }

    // ---------------------------------------------------------
    // 2. Security & Best Practices Check
    // ---------------------------------------------------------
    printHeader('Security & Best Practices')
    let securityIssuesFound = 0

    // Check NODE_ENV
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'development') {
        printWarning(
            'NODE_ENV Environment Variable',
            `Current value: '${process.env.NODE_ENV}'. Expected 'production' or 'development'.`
        )
        results.security.status = 'warn'
        securityIssuesFound++
    } else {
        printSuccess('NODE_ENV Environment Variable', `(Set to ${process.env.NODE_ENV})`)
    }

    // Check JWT Secret Strength
    const jwtSecret = process.env.JWT_SECRET || ''
    if (jwtSecret.length < 32) {
        printWarning(
            'JWT Secret Strength',
            'JWT_SECRET is extremely short (< 32 chars). This makes tokens vulnerable to brute-force attacks.'
        )
        results.security.status = 'warn'
        securityIssuesFound++
    } else {
        printSuccess('JWT Secret Strength', '(Appears robust based on length)')
    }

    // Check for obvious default passwords
    const dbPassword = process.env.DB_PASSWORD || process.env.MONGODB_URI
    if (
        dbPassword &&
        (dbPassword.includes('admin') ||
            dbPassword.includes('password') ||
            dbPassword.includes('1234'))
    ) {
        printError(
            'Database Password',
            'Avoid using predictable substrings like "admin" or "password".',
            'Update your MONGODB_URI and DB_PASSWORD.'
        )
        results.security.status = 'fail'
        securityIssuesFound++
    }

    // Check exposed sensitive files in root
    const fs = require('fs')
    const path = require('path')
    const sensitiveFiles = ['.env', '.env.local', 'docker-compose.yml', 'package.json']
    const exposeDir = path.resolve(__dirname, '../public')
    if (fs.existsSync(exposeDir)) {
        let exposedFiles = []
        sensitiveFiles.forEach((file) => {
            if (fs.existsSync(path.join(exposeDir, file))) {
                exposedFiles.push(file)
            }
        })

        if (exposedFiles.length > 0) {
            printError(
                'Exposed Sensitive Files',
                `Found files in public directory: ${exposedFiles.join(', ')}`,
                'Move these out of any publicly served directory IMMEDIATELY.'
            )
            results.security.status = 'fail'
            securityIssuesFound++
        } else {
            printSuccess(
                'Public Directory Security',
                '(No sensitive configuration files found in web root)'
            )
        }
    } else {
        printInfo('Public Directory check skipped', '(No public/ directory found to check)')
    }

    if (securityIssuesFound === 0) {
        if (results.security.status === 'pass') {
            printSuccess('Overall Security Posture', '(Passed basic static checks)')
        }
    }

    // ---------------------------------------------------------
    // 2. Firebase Configuration Check
    // ---------------------------------------------------------
    printHeader('Firebase Configuration')
    const firebaseEnv = [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    ]
    const missingFirebase = firebaseEnv.filter((key) => !process.env[key])

    if (missingFirebase.length === 0) {
        printSuccess('Firebase Variables', '(API Key, Domain, Project ID configured)')
    } else {
        results.firebase.status = 'warn'
        results.firebase.issues.push(`Missing: ${missingFirebase.join(', ')}`)
        printWarning(
            'Firebase Variables',
            `Missing keys: ${missingFirebase.join(', ')} (Frontend auth might fail)`
        )
    }

    // ---------------------------------------------------------
    // 3. Database Connection Check
    // ---------------------------------------------------------
    printHeader('Database Backend (MongoDB)')
    const uri = process.env.MONGODB_URI
    if (!uri) {
        results.db.status = 'fail'
        results.db.issues.push('No MongoDB URI provided.')
        printError('MongoDB Connection', 'Cannot test - MONGODB_URI is undefined.')
    } else {
        try {
            printInfo('Connecting to MongoDB Atlas...')
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
            printSuccess('MongoDB Connection', '(Successfully pinged the database cluster)')
            results.db.status = 'pass'
            await mongoose.disconnect()
        } catch (err) {
            results.db.status = 'fail'
            results.db.issues.push(err.message)
            let tip = 'Check network connectivity or database status.'
            if (err.message.includes('Authentication failed')) {
                tip = 'Wrong credentials OR your current IP is not whitelisted in MongoDB Atlas.'
            } else if (err.message.includes('timeout')) {
                tip = 'Connection timed out. Ensure your IP is whitelisted or check your network.'
            }
            printError('MongoDB Connection', `${err.message} (Code: ${err.code || 'N/A'})`, tip)
        }
    }

    // ---------------------------------------------------------
    // 4. Docker Engine Check
    // ---------------------------------------------------------
    printHeader('Execution Engine (Docker)')
    const dockerHost = process.env.DOCKER_HOST || 'No Host defined'
    printInfo('Docker Host URL', dockerHost)

    const dockerOptions = {}
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
    try {
        await docker.ping()
        printSuccess('Docker Daemon', '(Connection established and responding)')
        results.docker.status = 'pass'
    } catch (err) {
        results.docker.status = 'fail'
        results.docker.issues.push(err.message)
        let tip = 'Ensure Docker Desktop is running.'
        if (dockerHost.includes('2375')) {
            tip =
                'If using docker-proxy on Windows, ensure port 2375 is mapped in your docker-compose.yml and the container is running.'
        }
        printError('Docker Daemon', err.message, tip)
    }

    // ---------------------------------------------------------
    // 5. System Health Summary
    // ---------------------------------------------------------
    console.log(`\n${c.bold}==========================================${c.reset}`)
    console.log(`         ${c.bold}SYSTEM HEALTH SUMMARY${c.reset}`)
    console.log(`==========================================`)

    const getStatusIcon = (status) => {
        if (status === 'pass') return `${c.green}✅ OK${c.reset}  `
        if (status === 'warn') return `${c.yellow}⚠️  WARN${c.reset}`
        return `${c.red}❌ FAIL${c.reset}`
    }

    console.log(` Environment : ${getStatusIcon(results.env.status)}`)
    console.log(` Security    : ${getStatusIcon(results.security.status)}`)
    console.log(` Firebase    : ${getStatusIcon(results.firebase.status)}`)
    console.log(` Database    : ${getStatusIcon(results.db.status)}`)
    console.log(` Docker      : ${getStatusIcon(results.docker.status)}`)
    console.log(`==========================================\n`)

    const anyFailures = Object.values(results).some((r) => r.status === 'fail')
    if (anyFailures) {
        console.log(
            `${c.red}${c.bold}CONCLUSION: System is NOT ready. Please fix the above errors.${c.reset}\n`
        )
        process.exit(1)
    } else {
        const anyWarnings = Object.values(results).some((r) => r.status === 'warn')
        if (anyWarnings) {
            console.log(
                `${c.yellow}${c.bold}CONCLUSION: System is mostly ready, but has warnings. Proceed with caution.${c.reset}\n`
            )
        } else {
            console.log(
                `${c.green}${c.bold}CONCLUSION: All systems go! Backend is fully operational.${c.reset}\n`
            )
        }
        process.exit(0)
    }
}

runDiagnostics()
