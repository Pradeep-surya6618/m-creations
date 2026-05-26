import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // LAN origins allowed to hit the dev server (HMR cross-origin guard).
  // Add new entries here when your machine's LAN IP changes.
  allowedDevOrigins: ["10.174.53.148"],
};

export default nextConfig;
