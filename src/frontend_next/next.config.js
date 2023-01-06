/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.intra.42.fr',
        port: '',
        // pathname: '/account123/**',
      },
    ],
  },
};

module.exports = nextConfig;
