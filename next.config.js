// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,

    async rewrites() {
        return [
            {
                source: '/api/:path*',
                // ✅ Remove /api from destination as well
                destination: process.env.NEXT_PUBLIC_API_URL
                    ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
                    : 'https://cleaning-validation-backend.onrender.com/api/:path*',
            },
        ]
    },

    images: {
        domains: ['localhost'],
        unoptimized: true,
    },

    env: {
        NEXT_PUBLIC_APP_VERSION: '3.0.0',
    },

    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                fs: false,
                net: false,
                tls: false,
            }
        }
        return config
    },

    output: 'standalone',
}

module.exports = nextConfig