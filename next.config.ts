import type { NextConfig } from "next";

// Fully static site (Cloudflare Pages). URLs keep the trailing slash, exactly like WordPress.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
