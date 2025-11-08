import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // For Render deployment
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
