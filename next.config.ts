import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/**': ['./data/**'],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "primevapesaustralia.com",
      },
      {
        protocol: "https",
        hostname: "**.primevapesaustralia.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      }
    ],
  },
};

export default nextConfig;

