/** @type {import('next').NextConfig} */
const visitadorApi = process.env.VISITADOR_API_REWRITE_TARGET || "http://localhost:4000";
const chequeoApi = process.env.CHEQUEO_API_REWRITE_TARGET || "http://localhost:3001";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-chequeo/:path*",
        destination: `${chequeoApi.replace(/\/$/, "")}/api/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${visitadorApi.replace(/\/$/, "")}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;