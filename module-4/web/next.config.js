/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        port: "",
        pathname: "/*/**",
      },
    ],
  },
};

module.exports = nextConfig;
