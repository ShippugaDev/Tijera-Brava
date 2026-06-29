import type { NextConfig } from "next";

const backendUrl = "https://tijera-brava.onrender.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`
      }
    ];
  }
};

export default nextConfig;
