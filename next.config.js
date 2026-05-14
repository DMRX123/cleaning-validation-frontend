/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'https://cleaning-validation-backend.onrender.com/api/:path*',
            },
        ]
    },
    images: {
        domains: ['localhost'],
    },
}

module.exports = nextConfig