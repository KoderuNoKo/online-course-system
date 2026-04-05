/** @type {import('next').NextConfig} */
// Server-side proxy target (Docker: http://api:4000). Browser calls same-origin /api/* only.
const apiInternalUrl =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:4000";

const nextConfig = {
  typedRoutes: false,
  async rewrites() {
    const base = apiInternalUrl.replace(/\/$/, "");
    return [{ source: "/api/:path*", destination: `${base}/api/:path*` }];
  }
};

export default nextConfig;
