/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com', 'res.cloudinary.com'],
  },
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
}

module.exports = nextConfig
