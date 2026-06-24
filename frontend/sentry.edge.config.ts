import * as Sentry from "@sentry/nextjs";

// Edge runtime (middleware) error monitoring. No-op when the DSN is unset.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
});
