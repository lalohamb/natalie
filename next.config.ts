import type { NextConfig } from "next";

/*
 * Baseline security headers for every response.
 *
 * The Content-Security-Policy is deliberately limited to directives that need
 * no per-request nonce (pages are prerendered, so script nonces aren't
 * available): it blocks framing by other sites, <base> hijacking and plugins.
 */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 90],
    // YouTube video thumbnails for linked videos on /media and the homepage.
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      { protocol: "https", hostname: "images-api.printify.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // Navigation restructure (Gate 1 approvals)
      { source: "/booking", destination: "/events", permanent: true },
      { source: "/courses", destination: "/teachings", permanent: true },
      { source: "/courses/:slug", destination: "/teachings/:slug", permanent: true },

      // Legacy Squarespace book URLs → new book detail pages
      { source: "/repairingthebreach", destination: "/books/repairing-the-breach", permanent: true },
      { source: "/repairingthebreach/prophetic-purity", destination: "/books/repairing-the-breach", permanent: true },
      { source: "/repair-the-breach-workbook", destination: "/books/repair-the-breach-workbook", permanent: true },
      { source: "/repair-the-breach-workbook/training", destination: "/books/repair-the-breach-workbook", permanent: true },
      { source: "/the-midwife-to-your-destiny", destination: "/books/the-midwife-to-your-destiny", permanent: true },
      { source: "/the-midwife-to-your-destiny/guide", destination: "/books/the-midwife-to-your-destiny", permanent: true },
      { source: "/war-in-the-wait-1", destination: "/books/war-in-the-wait", permanent: true },
      { source: "/war-in-the-wait-1/book", destination: "/books/war-in-the-wait", permanent: true },
      { source: "/war-in-the-wait-2", destination: "/books/war-in-the-wait", permanent: true },
      { source: "/purchase-book", destination: "/books/from-the-chaos-to-the-call", permanent: true },

      // Legacy Squarespace store URLs → new store
      { source: "/store-1", destination: "/store", permanent: true },
      { source: "/store-1/pray-hoodies", destination: "/store", permanent: true },
      { source: "/store-1/pray-t-shirts", destination: "/store", permanent: true },

      // Legacy orphaned / demo pages → homepage
      { source: "/home", destination: "/", permanent: true },
      { source: "/polaris", destination: "/", permanent: true },
      { source: "/vanguard-set", destination: "/", permanent: true },
      { source: "/meltdown-tour", destination: "/", permanent: true },
      { source: "/read-me-adversary", destination: "/", permanent: true },

      // Legacy expired offers → closest current equivalent
      { source: "/new-products", destination: "/books/the-midwife-to-your-destiny", permanent: true },
      { source: "/new-products/:path*", destination: "/books/the-midwife-to-your-destiny", permanent: true },
      { source: "/destinywebinarwithbook", destination: "/books/the-midwife-to-your-destiny", permanent: true },
      { source: "/destinywebinarwithbook/:path*", destination: "/books/the-midwife-to-your-destiny", permanent: true },
      { source: "/leap-registration", destination: "/contact", permanent: true },
    ];
  },
};

export default nextConfig;
