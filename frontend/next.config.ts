// next.config.ts
import type { NextConfig } from 'next';

// Allow the app to reach its API (REST + WebSocket) over both prod and local origins.
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const apiOrigin = new URL(apiUrl).origin;
const wsOrigin = apiOrigin.replace(/^http/, 'ws');
const turnstile = 'https://challenges.cloudflare.com';
const connectSrc = [
  "'self'",
  apiOrigin,
  wsOrigin,
  'http://localhost:8000',
  'ws://localhost:8000',
  turnstile,
  'https://*.sentry.io', // error reporting (no-op unless a DSN is configured)
].join(' ');

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${turnstile}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src ${connectSrc}`,
  `frame-src ${turnstile}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  // Emit a minimal standalone server for small production Docker images.
  output: 'standalone',
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
