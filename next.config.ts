import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  trailingSlash: true,
  // Disable React StrictMode for DevTools compatibility
  reactStrictMode: false,
  
  // Enable TypeScript type checking
  typescript: {
    ignoreBuildErrors: false,
  },

  // Image optimization configuration
  images: {
    unoptimized: true, // Required for Netlify
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.firebaseapp.com',
      },
    ],
  },

  // Experimental features for better Netlify support
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin']
  },

  // Webpack configuration
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

export default nextConfig;