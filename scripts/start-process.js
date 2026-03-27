import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const requestedType = (process.argv[2] || 'API').toUpperCase()
const processType = requestedType === 'WORKER' ? 'WORKER' : 'API'

const standaloneServerPath = path.join(process.cwd(), '.next', 'standalone', 'server.js')
const nextStartCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx'

const child = fs.existsSync(standaloneServerPath)
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
