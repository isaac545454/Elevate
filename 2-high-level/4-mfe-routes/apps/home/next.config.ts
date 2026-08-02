import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.."),
  },
  transpilePackages: [
    "@next-modular-arch/http",
    "@next-modular-arch/module-registry",
    "@next-modular-arch/query",
    "@next-modular-arch/ui-data",
    "@next-modular-arch/ui-errors",
  ],
};

export default nextConfig;
