/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  turbopack: false,
  reactCompiler: true,
  serverExternalPackages: [
    'mongoose',
    'dockerode',
    'ssh2',
    'bcryptjs',
    'jsonwebtoken',
    'tar-stream',
  ],
};

export default nextConfig;
