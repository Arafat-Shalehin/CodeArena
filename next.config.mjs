/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    output: 'standalone',
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
