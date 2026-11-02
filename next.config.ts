import type { NextConfig } from "next";

// DESKTOP=1 -> build static export untuk aplikasi desktop (Electron memakai folder out/)
const isDesktop = process.env.DESKTOP === "1";

const nextConfig: NextConfig = {
  ...(isDesktop ? ({ output: "export" } as const) : ({ output: "standalone" } as const)),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
