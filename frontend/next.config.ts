import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Transpile leaflet packages for SSR compatibility
  transpilePackages: ["react-leaflet", "leaflet"],
};

export default nextConfig;
