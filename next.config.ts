import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  // Prevent clickjacking
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  // Prevent MIME type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Referrer policy for privacy
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Control browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // DNS prefetch control
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

if (isProd) {
  // Strict transport security (HTTPS only)
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });

  // Basic CSP to prevent XSS
  securityHeaders.push({
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://maps.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maps.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      // Allow Google Maps iframe embeds
      "frame-src 'self' https://maps.google.com https://www.google.com https://maps.googleapis.com",
      "connect-src 'self' ws: wss: https://maps.googleapis.com https://maps.google.com https://*.googleapis.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  });
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Extra cache headers for API routes
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },

  // ─── Dev Experience ───────────────────────────────────────────────────────
  devIndicators: {
    position: "bottom-right",   // Move away if shown, but CSS will hide it
  },
  reactStrictMode: false,       // Disable double-render in dev (faster dev UX)
  allowedDevOrigins: [
    "localhost:3000",
    "10.35.189.25:3000",
    "304cbbb4ea08bb.lhr.life",
    "*.lhr.life",
    "*.loca.lt"
  ],

  // ─── Router loading bar ───────────────────────────────────────────────────
  experimental: {
    clientRouterFilterRedirects: false,
  },

  // ─── Production optimizations ─────────────────────────────────────────────
  poweredByHeader: false,       // Remove X-Powered-By: Next.js header
  compress: true,               // Enable gzip compression

  // ─── Image optimization ───────────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600,
  },
};

export default nextConfig;
