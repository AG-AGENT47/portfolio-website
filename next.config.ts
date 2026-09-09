import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Neon is queried from a Node.js Server Component at build time (see
  // src/lib/db.ts) — no edge runtime, no experimental flags needed.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
