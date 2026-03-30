/** @type {import('next').NextConfig} */
const isWorkerProcess = (process.env.PROCESS_TYPE || '').toUpperCase() === 'WORKER'

const nextConfig = {
    /* config options here */
    output: 'standalone',
    distDir: isWorkerProcess ? '.next-worker' : '.next',
    reactCompiler: true,
    serverExternalPackages: [
        'mongoose',
        'dockerode',
        'ssh2',
        'bcryptjs',
        'jsonwebtoken',
        'tar-stream',
        'socket.io',
        '@socket.io/redis-adapter',
    ],
}

export default nextConfig
