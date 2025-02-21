/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/jobs',
        destination: 'https://api.ashbyhq.com/posting-api/job-board/openai?includeCompensation=true'
      }
    ];
  },
  // Ensure proper error handling and logging
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  }
};

module.exports = nextConfig;
