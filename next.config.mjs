/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ['dockerode', 'ssh2'],
};

export default nextConfig;
