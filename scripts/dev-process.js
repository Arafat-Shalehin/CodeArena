import { spawn } from 'node:child_process'

const requestedType = (process.argv[2] || 'API').toUpperCase()
const processType = requestedType === 'WORKER' ? 'WORKER' : 'API'
const requestedPort = process.argv[3]

const command = requestedPort ? `npx next dev -p ${requestedPort}` : 'npx next dev'

const child = spawn(command, {
    shell: true,
    stdio: 'inherit',
    env: {
        ...process.env,
        PROCESS_TYPE: processType,
    },
})

child.on('exit', (code, signal) => {
    if (signal) {
        process.kill(process.pid, signal)
        return
    }
    process.exit(code ?? 1)
})

child.on('error', (error) => {
    console.error('[DevProcess] Failed to start Next.js dev server:', error.message)
    process.exit(1)
})
