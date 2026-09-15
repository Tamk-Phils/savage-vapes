import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname),
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
      },
      {
        protocol: "https",
        hostname: "apvapeshop.com",
      },
      {
        protocol: "https",
        hostname: "**.apvapeshop.com",
      }
    ],
  },
};

export default nextConfig;

