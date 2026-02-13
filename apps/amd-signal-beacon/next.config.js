/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Redirect all /signal/* routes to homepage (404 fix for Leke Leke posts)
  async redirects() {
    return [
      {
        source: '/signal/:slug*',
        destination: '/',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
// Force rebuild Wed Feb  4 16:06:37 WAT 2026
