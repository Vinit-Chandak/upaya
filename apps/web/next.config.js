/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@upaya/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
      },
    ],
  },
};

module.exports = nextConfig;
