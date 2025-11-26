import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'pino-pretty': false,
      'pino-abstract-transport': false,
      'sonic-boom': false,
      '@react-native-async-storage/async-storage': false
    }
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /pino-pretty/,
      /pino-abstract-transport/,
      /sonic-boom/,
      /@react-native-async-storage/
    ]
    return config
  }
};

const withMDX = createMDX({
  extension: /\.mdx?$/
});

export default withMDX(nextConfig);
