/** @type {import('next').NextConfig} */
const visitadorApi = process.env.VISITADOR_API_REWRITE_TARGET || "http://localhost:4000";
const chequeoApi =
  process.env.CHEQUEO_API_REWRITE_TARGET ||
  process.env.NEXT_PUBLIC_CHEQUEO_API_URL ||
  "http://localhost:3001";

function normalizeChequeoTarget(raw) {
  const base = String(raw || "").trim().replace(/\/$/, "");
  if (!base) return { base: "", hasApiSuffix: false };
  const hasApiSuffix = /\/api$/i.test(base);
  return { base, hasApiSuffix };
}

const nextConfig = {
  async rewrites() {
    const c = normalizeChequeoTarget(chequeoApi);
    return [
      {
        source: "/api-chequeo/:path*",
        destination: c.base
          ? `${c.base}/${c.hasApiSuffix ? "" : "api/"}:path*`
          : "http://localhost:3001/api/:path*",
      },
      {
        source: "/api/:path*",
        destination: `${visitadorApi.replace(/\/$/, "")}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;