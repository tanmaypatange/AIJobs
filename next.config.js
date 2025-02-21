/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/jobs',
        destination: 'https://api.ashbyhq.com/posting-api/job-board/openai?includeCompensation=false'
      }
    ];
  }
};

module.exports = nextConfig;
