# Project Manager

[![CI](https://github.com/andrei-sili/project-manager-api/actions/workflows/ci.yml/badge.svg)](https://github.com/andrei-sili/project-manager-api/actions/workflows/ci.yml)
[![Live demo](https://img.shields.io/badge/demo-pm.andreisili.com-34d399)](https://pm.andreisili.com)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.2-092E20?logo=django&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

A full-stack team-collaboration platform — Kanban boards, time tracking, team
roles, a calendar, analytics and real-time notifications. Built with a
Django REST + Channels backend and a Next.js frontend.

**Live demo:** [pm.andreisili.com](https://pm.andreisili.com) — log in with `alice@example.com` / `Demo1234!`

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="Dashboard" width="900">
</p>

---

## Features

- **Authentication** — JWT (access/refresh) with register, login, logout
  (refresh-token blacklist) and password reset.
- **Teams & roles** — invite members, roles (admin / manager / developer),
  with a guard that a team always keeps at least one admin.
- **Projects & tasks** — Kanban board with drag-and-drop, priorities,
  assignees, due dates, threaded comments and file attachments.
- **Time tracking** — live timer, manual entries, weekly target, charts and
  CSV export.
- **Calendar** — monthly view of tasks placed on their due dates.
- **Reports** — completion rate, status breakdown (donut), per-project
  progress and a member-contribution table.
- **Real-time notifications** — WebSocket bell that lights up instantly when
  you're assigned a task or someone comments on yours.
- **Activity feed** — audit log of who did what, across the workspace.
- **API documentation** — interactive Swagger UI at `/api/docs/`.

## Screenshots

| Kanban board | Calendar |
| --- | --- |
| ![Kanban](docs/screenshots/kanban.png) | ![Calendar](docs/screenshots/calendar.png) |

| Reports | Time tracking |
| --- | --- |
| ![Reports](docs/screenshots/reports.png) | ![Time tracking](docs/screenshots/time-tracking.png) |

| Projects | Teams |
| --- | --- |
| ![Projects](docs/screenshots/projects.png) | ![Teams](docs/screenshots/teams.png) |

## Tech stack

**Backend** — Python 3.12 · Django 5.2 · Django REST Framework 3.16 ·
Channels + Daphne (WebSockets) · SimpleJWT · drf-spectacular (OpenAPI) ·
django-filter · WhiteNoise · PostgreSQL / SQLite · Redis (channel layer) ·
pytest.

**Frontend** — Next.js 15 (App Router) · React 19 · TypeScript · Tailwind
CSS 4 · Zustand · Recharts · @hello-pangea/dnd · Axios.

**Infra** — Docker · docker-compose · GitHub Actions CI.

## Architecture

Django apps under `apps/`, each owning its models, serializers, views and
permissions:

| App | Responsibility |
| --- | --- |
| `users` | custom user (email login), auth, password reset |
| `teams` | teams, memberships, roles, invitations |
| `projects` | projects |
| `tasks` | tasks (Kanban, status, priority, assignees) |
| `comments` | threaded task comments |
| `taskfiles` | task file attachments |
| `timetrack` | time entries and summaries |
| `notify` | notifications + WebSocket consumer |
| `logs` | activity / audit log |

## Getting started (local)

Requirements: Python 3.12, Node.js 22. Redis/PostgreSQL are optional in dev
(SQLite and an in-memory channel layer are used by default).

### Backend

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # set SECRET_KEY and ENVIRONMENT=development
python manage.py migrate
python seed_demo.py             # optional: rich demo data
python manage.py runserver      # http://localhost:8000
```

### Frontend

```bash
cd frontend
cp .env.example .env.local      # NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm install
npm run dev                     # http://localhost:3000
```

**Demo login:** `alice@example.com` / `Demo1234!` (after running `seed_demo.py`).

- App: <http://localhost:3000>
- API docs (Swagger): <http://localhost:8000/api/docs/>

## Run with Docker

The full production-like stack (PostgreSQL + Redis + Django/ASGI + Next.js)
in one command:

```bash
cp .env.example .env            # set a strong SECRET_KEY
docker compose up --build
```

The backend image exposes a `/api/health/` check that `docker compose` waits
on before starting the frontend. Uploaded files are served through an
authenticated endpoint (not a public `/media/` path), so they work in
production without a separate static host.

**Deploying live:** push the two images to a managed platform (Fly.io,
Railway or Render) that terminates HTTPS for you, then set `ENVIRONMENT=production`,
a strong `SECRET_KEY`, `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`/`CORS_ALLOWED_ORIGINS`
and point `NEXT_PUBLIC_API_URL` at the API origin.

## Tests & quality

```bash
pytest                          # backend tests
python manage.py check --deploy # security checklist (clean in production)

cd frontend && npm test && npm run lint && npm run build   # frontend tests, lint, build
```

## Security highlights

Secure-by-default permissions, object-level authorization, JWT with
refresh-token blacklist, rate limiting on auth endpoints, password-strength
validation, upload type/size validation, and production security headers
(HSTS, secure cookies, SSL redirect) gated behind `ENVIRONMENT`.

## License

See [LICENSE](LICENSE).
