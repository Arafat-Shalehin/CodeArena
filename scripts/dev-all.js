import { spawn } from 'node:child_process'
import path from 'node:path'

const devProcessScript = path.join(process.cwd(), 'scripts', 'dev-process.js')
const children = []
let shuttingDown = false

function startProcess(name, args) {
    const child = spawn(process.execPath, [devProcessScript, ...args], {
        stdio: 'inherit',
        env: {
            ...process.env,
        },
    })

    child.on('error', (error) => {
        console.error(`[DevAll] Failed to start ${name}:`, error.message)
        shutdown(1)
    })

    child.on('exit', (code, signal) => {
        if (shuttingDown) return

        if (signal) {
            console.error(`[DevAll] ${name} exited by signal ${signal}`)
            shutdown(1)
            return
        }

        if ((code ?? 0) !== 0) {
            console.error(`[DevAll] ${name} exited with code ${code}`)
            shutdown(code ?? 1)
            return
        }

        console.error(`[DevAll] ${name} exited unexpectedly.`)
        shutdown(1)
    })

    children.push(child)
}

function shutdown(exitCode = 0) {
    if (shuttingDown) return
    shuttingDown = true

    for (const child of children) {
        if (!child.killed) {
            child.kill('SIGINT')
        }
    }

    setTimeout(() => {
        for (const child of children) {
            if (!child.killed) {
                child.kill('SIGKILL')
            }
        }
        process.exit(exitCode)
    }, 1000)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

startProcess('API', ['API'])
startProcess('WORKER', ['WORKER', '3004'])
