import type { NextConfig } from "next";

const API_URL = process.env.URL_BACKEND || "http://localhost:3000";

const nextConfig: NextConfig = {
  // https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites
  async rewrites() {
    return [
      {
        source: "/api/:path*", // ที่ frontend เรียก
        destination: `${API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
