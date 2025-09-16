import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import path from 'path'

const nextConfig: NextConfig = {
  experimental: { mdxRs: true },
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@mdx-js/react': path.join(__dirname, 'src/shims/mdx-react.ts'),
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

const withMDX = createMDX({
  extension: /\.mdx?$/
});

export default withMDX(nextConfig);
