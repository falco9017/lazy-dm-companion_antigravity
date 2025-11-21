/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        ...(process.env.NODE_ENV === 'development' && { NEXTAUTH_URL: "http://localhost:3000" }),
    },
};

module.exports = nextConfig;
