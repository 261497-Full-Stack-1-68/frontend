import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites
  async rewrites() {
    return [
      {
        source: "/api/:path*", // ที่ frontend เรียก
        destination: "http://localhost:3000/:path*", // ไปที่ backend จริง
      },
    ];
  },
};

export default nextConfig;
