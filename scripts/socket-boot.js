import nextEnv from '@next/env'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd())

console.log('[SocketBoot] Starting CodeArena socket process...')

async function startSocketServer() {
    const { initSocketServer } = await import('@/lib/socket-server.js')
    await initSocketServer()
    console.log('[SocketBoot] Socket server initialized successfully.')
}

function setupSignalHandlers() {
    const shutdown = (signal) => {
        console.log(`[SocketBoot] Received ${signal}, shutting down socket process...`)
        process.exit(0)
    }

    process.on('SIGINT', () => shutdown('SIGINT'))
    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGHUP', () => shutdown('SIGHUP'))
}

startSocketServer()
    .then(() => {
        setupSignalHandlers()
    })
    .catch((error) => {
        console.error('[SocketBoot] Failed to initialize socket server:', error?.message || error)
        console.error(error?.stack || '')
        process.exit(1)
    })
