/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Rewrite /api/social/* → /api/test-version/social/*
  // This fixes "Unexpected token '<'...not valid JSON" — all frontend
  // fetch calls use /api/social/ but route handlers live under /api/test-version/social/
  async rewrites() {
    return [
      {
        source: '/api/social/:path*',
        destination: '/api/test-version/social/:path*',
      },
    ];
  },
}

module.exports = nextConfig