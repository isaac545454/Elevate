import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  turbopack: {
    // workspace root (main-app + modules + shared)
    root: path.join(path.dirname(fileURLToPath(import.meta.url)), ".."),
  },
  transpilePackages: [
    "@repo/shared",
    "@repo/jsonplaceholder",
    "@repo/pokemon",
    "@repo/rick-and-morty",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "i.picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "rickandmortyapi.com", pathname: "/**" },
      { protocol: "https", hostname: "raw.githubusercontent.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
