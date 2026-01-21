/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true
  },
  experimental: {
    esmExternals: false
  },
  allowedDevOrigins: [
    '5b3a9e13-ac41-4bb6-b7aa-1b9a87995662-00-unvcxf3c6r7w.kirk.replit.dev',
    '.replit.dev',
    '.repl.co',
    '127.0.0.1'
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    return config;
  },
  serverExternalPackages: ['firebase-admin']
}

module.exports = nextConfig