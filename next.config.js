/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'export', // Disabled for SSR with Supabase real-time data
  distDir: '.next',
}
module.exports = nextConfig
