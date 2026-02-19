import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Environment variables for SEO
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "https://jradianceco.com",
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jradianceco.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.jradianceco.com",
        pathname: "/**",
      },
      // Add Namecheap storage domain if used
      // {
      //   protocol: "https",
      //   hostname: "storage.yournamecheapdomain.com",
      //   pathname: "/**",
      // },
    ],
    // Performance optimization
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable modern image formats
    formats: ["image/webp", "image/avif"],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://fp.paystack.co https://*.supabase.co https://*.fingerprintjs.com https://*.fpcdn.io https://*.datadoghq.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://jradianceco.com https://www.jradianceco.com; connect-src 'self' https://*.supabase.co https://*.datadoghq.com https://fp.paystack.co; frame-src 'self' https://js.paystack.co;",
          },
          // Additional security headers for SEO
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      // Cache headers for static assets
      {
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
