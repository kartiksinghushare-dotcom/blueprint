/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  api: {
    responseLimit: '50mb',
  },
}

module.exports = nextConfig
