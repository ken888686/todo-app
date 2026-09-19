import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: isProduction ? { exclude: ["error", "warn"] } : false,
  },
  poweredByHeader: false,
  allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev", "127.0.0.1"],
};

export default nextConfig;
