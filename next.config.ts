import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  // Allow eval temporarily to unblock; tighten later
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https:",
  "style-src 'self' 'unsafe-inline' https:",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https: wss: data: blob:",
  "frame-src 'self' https:",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ')

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp }
        ]
      }
    ]
  }
};

export default nextConfig;
