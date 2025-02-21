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
  // Add this to handle potential fetch issues
  experimental: {
    serverActions: true
  }
};

module.exports = nextConfig;
