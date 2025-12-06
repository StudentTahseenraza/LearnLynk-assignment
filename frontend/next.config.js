/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['vvztsqjjttrthtzchlcx.supabase.co'],
  },
  // For production deployment
  output: 'standalone', // For Docker deployment
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
}

module.exports = nextConfig