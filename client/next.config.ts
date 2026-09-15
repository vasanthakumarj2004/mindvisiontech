import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent browser from sniffing MIME type away from declared content-type
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Prevent clickjacking by forbidding embedding in iframes
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Control referrer information sent with requests
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Restrict access to sensitive device features & browser APIs
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // Enforce HTTPS communication
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Enable DNS prefetching for performance
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "100.97.139.98",
    "10.242.206.121",
    "10.242.206.139",
    "localhost:3000",
    "localhost:3001",
    "localhost:3002",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "dummyimage.com" },
    ],
  },
  async headers() {
    return [
      {
        // Apply these security headers to all routes in the application
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
