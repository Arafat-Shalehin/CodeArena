import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    // Allow next/image to optimize images from these external domains
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
            },
        ],
        // Use modern AVIF format for best compression, WebP as fallback
        formats: ['image/avif', 'image/webp'],
    },
    // Compress responses
    compress: true,
    // Enable experimental features for performance
    experimental: {
        optimizeCss: true,
        optimizePackageImports: ['react-icons'],
    },
}

export default withBundleAnalyzer(nextConfig)
