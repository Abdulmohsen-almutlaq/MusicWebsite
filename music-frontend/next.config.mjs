/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://api:3000/api/:path*', // Proxy to Backend
      },
      {
        source: '/covers/:path*',
        destination: 'http://api:3000/covers/:path*', // Proxy to Static files
      },
    ]
  },
};

export default nextConfig;
