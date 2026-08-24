import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  devIndicators: false,
  allowedDevOrigins: ['127.0.0.1'],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "X-XSS-Protection",          value: "1; mode=block" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.github.com",
              "frame-src https://www.google.com https://sicmchurch.gt.tc",
              "media-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://mail.google.com https://wa.me",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
