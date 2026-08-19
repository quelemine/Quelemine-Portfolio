import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "github-readme-stats.vercel.app" },
      { protocol: "https", hostname: "github-readme-streak-stats.herokuapp.com" },
    ],
  },
  devIndicators: false,
};

export default nextConfig;
