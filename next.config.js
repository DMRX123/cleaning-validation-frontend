/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: process.env.NEXT_PUBLIC_API_URL
                    ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
                    : 'https://cleaning-validation-backend.onrender.com/api/:path*',
            },
        ]
    },
    images: {
        domains: ['localhost'],
    },
}

module.exports = nextConfig