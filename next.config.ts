import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // domains: ["cdn.shopify.com"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 60 * 60 * 24,
    /* Let the optimizer output AVIF or WebP where supported */
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
