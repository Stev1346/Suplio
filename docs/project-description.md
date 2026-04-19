# GotATune Project Description

## Overview

GotATune is a QR-based song request platform for live DJ events. Guests use their
phones to scan an event code, request songs, and vote on what should play next.
DJs use a private dashboard to create and manage events, moderate requests, and
control the event lifecycle.

Core product goals:

- Reduce interruptions at the DJ booth
- Increase crowd engagement
- Give DJs clear control over incoming requests

## Product Identity

- Product name: GotATune
- Tagline: GotATune? Scan. Request. Vote.
- Brand direction: professional, energetic, simple, event-focused

## User Flows

### Guest Flow

1. Scan event QR code
2. Open event pages (Scan / Request / Vote)
3. Submit request (with throttling and abuse controls)
4. Vote on active requests

### DJ Flow

1. Create account and complete DJ profile
2. Create/manage events from dashboard
3. Moderate request queue (accept/reject/played)
4. Control event lifecycle and request availability

## Current Delivered Scope (through Phase 9)

- DJ auth and private route guards
- Role-aware navigation (guest and DJ)
- DJ dashboard with event creation and metrics
- Event management with lifecycle states (`draft`, `live`, `ended`, `archived`)
- DJ profile management and avatar handling
- DJ-owned event search with UX polish
- Lifecycle timestamping and cron-driven lifecycle sweeps
- QA and deploy readiness: Playwright E2E + RLS probes, regression runbook, deploy/smoke runbook, security review checklist, centralized feature flags, server error logging baseline (`captureServerError`)

## Security and Data Model Direction

- Supabase Auth-only session strategy
- Owner-based access model for DJ resources (`events`, `dj_profiles`)
- RLS policy matrix defined in Phase 0.5 contract
- Anti-abuse controls for request/vote behavior
- Account recovery and verification baseline implemented

## Architecture Snapshot

- Frontend: Next.js App Router + React + TypeScript
- UI system: shadcn/ui + Radix + Tailwind
- Backend/data: Supabase (Postgres + RLS + Auth + Storage + Realtime)
- Deploy target: Vercel + Supabase
- Testing: Playwright (E2E + RLS checks)

## Cost and Delivery Principles

- Keep operations lean and low-cost while validating core behavior
- Favor reliability, readability, and clean architecture boundaries
- Prioritize safe iteration with clear docs and sprint tracking

## How to Update This Document Per Phase

When a phase is completed:

1. Update **Current Delivered Scope** with newly shipped capabilities.
2. Update **Security and Data Model Direction** if auth/RLS or policies changed.
3. Update **Architecture Snapshot** if stack/runtime/testing decisions changed.
4. Keep this file product-focused; put execution details in:
   - `docs/sprints/` for sprint boards
   - `docs/runbook-regression.md` for QA checks
   - `docs/deploy.md` for deployment/runbook steps
