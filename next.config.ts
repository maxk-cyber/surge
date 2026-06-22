import type { NextConfig } from "next";
import path from "path";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const pagesBasePath = "/surge";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  outputFileTracingRoot: path.join(__dirname),
  eslint: { ignoreDuringBuilds: true },
  ...(isGitHubPages
    ? {
        output: "export" as const,
        basePath: pagesBasePath,
        assetPrefix: pagesBasePath,
        images: { unoptimized: true },
        env: { NEXT_PUBLIC_BASE_PATH: pagesBasePath },
      }
    : {}),
  reactStrictMode: false,
};

export default nextConfig;
