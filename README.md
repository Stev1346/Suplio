# Suplio

Suplio is a QR-based song request and voting platform for live DJ events.
Guests scan an event QR code to request songs and vote. DJs manage events from
a private dashboard with lifecycle controls, request moderation, and profile tools.

This repository contains both the frontend application and the Supabase-backed
backend/data layer used to run the platform.

## Current Status

- Active sprint: **Custom Event Designs** (Phases 1–3 complete; **Phase 4** guest event theming in progress; interim guest Scan PNG download) — tracker [`docs/sprints/sprint-2026-07-custom-event-designs.md`](docs/sprints/sprint-2026-07-custom-event-designs.md), feature plan [`docs/features/features-custom-event-designs.md`](docs/features/features-custom-event-designs.md).
- Karaoke Mode sprint ([`docs/sprints/sprint-2026-05-karaoke-mode.md`](docs/sprints/sprint-2026-05-karaoke-mode.md)) is complete through **Phase 7 (QA, Regression, Documentation)**.
- Core DJ flows (auth, dashboard, event management, profile) and guest flows are implemented.
- Karaoke flow is implemented end-to-end (karaoke intake, queue list, performer-flow statuses, no-vote guest path).
- Event search, lifecycle automation, regression runbooks, and deploy smoke guidance are in place.
- Public marketing landing is shipped at `/`. Tracker: [`docs/sprints/sprint-2026-06-public-landing.md`](docs/sprints/sprint-2026-06-public-landing.md). Feature plan: [`docs/features/features-public-landing.md`](docs/features/features-public-landing.md).

## Tech Stack

- Frontend: Next.js App Router + React + TypeScript
- UI: shadcn/ui + Radix + Tailwind CSS
- Backend/data: Supabase (Postgres, Auth, RLS, Storage, Realtime)
- Hosting/deploy: Vercel + Supabase
- Testing: Playwright (E2E + RLS checks)

## Repository Structure

- `src/frontend` - Next.js application, API routes, UI, hooks, tests
- `supabase` - migration files and Supabase DB lifecycle assets
- `docs` - project docs, sprint tracking, runbooks, and security notes

## Prerequisites

- Node.js 20+
- npm 10+
- Supabase CLI

## Local Setup

1) Install frontend dependencies:

```bash
cd src/frontend
npm install
```

2) Configure environment variables:

```bash
cp .env.example .env.local
```

Required vars are documented in `src/frontend/.env.example`.

3) Start the dev server:

```bash
npm run dev
```

## Database Workflow

From repository root:

```bash
cd supabase
supabase db push
```

## Testing

From `src/frontend`:

First-time Playwright setup (downloads browsers):

```bash
npx playwright install chromium
```

```bash
npm run test:e2e
npm run test:rls
npm run test:qa
npm run test:e2e:ui
```

`npm run test:rls` and some E2E specs need Supabase and `E2E_*` variables from `.env.local` (see `src/frontend/.env.example`).

## Deployment and Operations

- Deploy and smoke checks: `docs/deploy.md`
- Regression validation checklist: `docs/runbook-regression.md`
- Security sign-off checklist: `docs/security-review.md`

## Documentation Index

- Project description and product context: `docs/project-description.md`
- DJ login and event management feature plan: `docs/features/features-dj-login-and-event-management.md`
- Sprint trackers: `docs/sprints/` (execution order by filename: `2026-04-dj-login`, `2026-05-karaoke-mode`, `2026-06-public-landing`, `2026-07-custom-event-designs`, `2026-08-onboarding`; next sprint should use `2026-09-*`.)
- Feature plans: `docs/features/`
- Deploy runbook: `docs/deploy.md`
- Regression runbook: `docs/runbook-regression.md`
- Security review checklist: `docs/security-review.md`

## Contributing Notes

- Keep backend security decisions aligned with RLS and auth boundaries
- Prefer reusable components/hooks and avoid prop-drilling where possible
- Update sprint and project docs when major features or phase states change

