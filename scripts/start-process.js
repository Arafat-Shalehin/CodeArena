import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const requestedType = (process.argv[2] || 'API').toUpperCase()
const processType = requestedType === 'WORKER' || requestedType === 'SOCKET' ? requestedType : 'API'

const standaloneServerPath = path.join(process.cwd(), '.next', 'standalone', 'server.js')
const nextStartCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const workerBootScript = path.join(process.cwd(), 'scripts', 'worker-boot.js')
const socketBootScript = path.join(process.cwd(), 'scripts', 'socket-boot.js')
const aliasLoaderScript = path.join(process.cwd(), 'scripts', 'alias-loader.mjs')
const aliasLoaderScriptUrl = pathToFileURL(aliasLoaderScript).href

let child

if (processType === 'WORKER') {
    console.log('[StartProcess] Starting worker-only process (no Next HTTP server)...')

    child = spawn(process.execPath, ['--loader', aliasLoaderScriptUrl, workerBootScript], {
        stdio: 'inherit',
        env: {
            ...process.env,
            PROCESS_TYPE: processType,
        },
    })
} else if (processType === 'SOCKET') {
    console.log('[StartProcess] Starting socket-only process (no Next HTTP server)...')

    child = spawn(process.execPath, ['--loader', aliasLoaderScriptUrl, socketBootScript], {
        stdio: 'inherit',
        env: {
            ...process.env,
            PROCESS_TYPE: processType,
        },
    })
} else {
    child = fs.existsSync(standaloneServerPath)
        ? spawn(process.execPath, [standaloneServerPath], {
              stdio: 'inherit',
              env: {
                  ...process.env,
                  PROCESS_TYPE: processType,
              },
          })
        : spawn(nextStartCommand, ['next', 'start'], {
              stdio: 'inherit',
              env: {
                  ...process.env,
                  PROCESS_TYPE: processType,
              },
          })
}

child.on('exit', (code, signal) => {
    if (signal) {
        process.kill(process.pid, signal)
        return
    }
    process.exit(code ?? 1)
})

child.on('error', (error) => {
    console.error('[StartProcess] Failed to start Next.js:', error.message)
    process.exit(1)
})
