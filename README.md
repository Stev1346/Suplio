# GotATune

GotATune is a QR-based song request and voting platform for live DJ events.
Guests scan an event QR code to request songs and vote. DJs manage events from
a private dashboard with lifecycle controls, request moderation, and profile tools.

This repository contains both the frontend application and the Supabase-backed
backend/data layer used to run the platform.

## Current Status

- Roadmap phases **0–9** are complete (see `docs/sprints/sprint-2026-04-phase-9.md` and `docs/DJ Login and Event Management.md`)
- Core DJ flows (auth, dashboard, event management, profile) and guest flows are implemented
- Event search, lifecycle automation, QA runbooks, and deploy smoke guidance are in place; **per-release** manual checks live in `docs/runbook-regression.md`

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
- Roadmap and phase history: `docs/DJ Login and Event Management.md`
- Sprint trackers: `docs/sprints/`
- Deploy runbook: `docs/deploy.md`
- Regression runbook: `docs/runbook-regression.md`
- Security review checklist: `docs/security-review.md`

## Contributing Notes

- Keep backend security decisions aligned with RLS and auth boundaries
- Prefer reusable components/hooks and avoid prop-drilling where possible
- Update sprint and project docs when major features or phase states change

