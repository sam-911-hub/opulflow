import type { NextConfig } from 'next';
import webpack from 'webpack';

const nextConfig: NextConfig = {
  // Enable TypeScript type checking
  typescript: {
    ignoreBuildErrors: false,
  },

  // Enable React StrictMode
  reactStrictMode: false,

  // Enable output file tracing
  output: 'export',

  // Enable trailing slash
  trailingSlash: true,

  // Set the target environment
  target: 'serverless',

  // Custom webpack configuration
  webpack: (config) => {
    // Disable fs, net, and tls polyfills
    config.resolve.fallback = { fs: false, net: false, tls: false };

    // Disable crypto polyfill
    config.resolve.fallback.crypto = require.resolve('crypto-browserify');

    // Disable stream polyfill
    config.resolve.fallback.stream = require.resolve('stream-browserify');

    // Disable process polyfill
    config.resolve.fallback.process = require.resolve('process/browser');

    // Return the updated config
    return config;
  },
};

export default nextConfig;