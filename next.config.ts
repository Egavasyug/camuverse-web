import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Temporarily disable MD/MDX pages to unblock build; will re-enable after MDX runtime fix
  pageExtensions: ['ts', 'tsx'],
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'pino-pretty': false,
      'pino-abstract-transport': false,
      'sonic-boom': false
    }
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /pino-pretty/,
      /pino-abstract-transport/,
      /sonic-boom/
    ]
    return config
  }
};

// MDX disabled for now
export default nextConfig;
