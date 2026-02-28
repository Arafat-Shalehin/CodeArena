/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    output: 'standalone',
    reactCompiler: true,
    experimental: {
        instrumentationHook: true,
    },
    serverExternalPackages: [
        'mongoose',
        'dockerode',
        'ssh2',
        'bcryptjs',
        'jsonwebtoken',
        'tar-stream',
    ],
}

export default nextConfig
