import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
