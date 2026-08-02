import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.."),
  },
  basePath: "/rick-and-morty",
  transpilePackages: [
    "@next-modular-arch/http",
    "@next-modular-arch/query",
    "@next-modular-arch/ui-data",
    "@next-modular-arch/ui-errors",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "rickandmortyapi.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
