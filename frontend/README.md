# Frontend — Project Manager

The web client for the Project Manager platform, built with Next.js 15 (App
Router), React 19 and TypeScript. See the [root README](../README.md) for the
full stack, architecture and the one-command Docker setup.

## Tech stack

- Next.js 15, React 19, TypeScript
- Tailwind CSS 4
- Zustand (state), Axios (API)
- Recharts (charts), lucide-react (icons), @hello-pangea/dnd (Kanban)
- Vitest + Testing Library (tests)

## Structure

```
src/
  app/         Next.js routes (App Router)
  components/  Shared UI components
  lib/         API client, auth/token helpers, types
```

## Develop

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL (e.g. http://localhost:8000/api)
npm run dev                  # http://localhost:3000
```

## Test, lint, build

```bash
npm test        # Vitest unit/component tests
npm run lint     # ESLint (next/core-web-vitals)
npm run build    # production build
```

All calls go through a single Axios client (`src/lib/axiosClient.ts`) that
attaches the JWT and transparently refreshes it on a 401.
