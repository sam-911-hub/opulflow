import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  // Disable React StrictMode for DevTools compatibility
  reactStrictMode: false,
  
  // Enable TypeScript type checking
  typescript: {
    ignoreBuildErrors: false,
  },

  // Image optimization configuration
  images: {
    unoptimized: true, // Disable if using Next.js Image Optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.firebaseapp.com',
      },
    ],
  },

  // Webpack configuration (optional)
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

export default nextConfig;